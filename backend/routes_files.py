"""File upload & serve routes."""

import logging

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)
from fastapi.responses import RedirectResponse

from models import new_id, now_iso
from deps import db, get_current_user
from storage import (
    build_path,
    put_object,
    content_type_for,
)

router = APIRouter(tags=["files"])
logger = logging.getLogger(__name__)

ALLOWED_EXT = {
    "jpg",
    "jpeg",
    "png",
    "webp",
    "pdf",
}

MAX_SIZE = 8 * 1024 * 1024


@router.post("/uploads")
async def upload(
    file: UploadFile = File(...),
    folder: str = "properties",
    user=Depends(get_current_user),
):

    filename = file.filename or "file.bin"

    ext = (
        filename.rsplit(".", 1)[-1].lower()
        if "." in filename
        else ""
    )

    if ext not in ALLOWED_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}",
        )

    data = await file.read()

    if len(data) > MAX_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large (Max 8MB)",
        )

    content_type = (
        file.content_type
        or content_type_for(filename)
    )

    path = build_path(
        user["id"],
        filename,
        folder=folder,
    )

    try:

        result = put_object(
            path,
            data,
            content_type,
        )

    except Exception as e:

        logger.exception("Upload failed")

        raise HTTPException(
            status_code=500,
            detail=f"Storage error: {e}",
        )

    doc = {
        "id": new_id(),

        # Cloudinary Public ID
        "storage_path": result["public_id"],

        # Cloudinary URL
        "file_url": result["secure_url"],

        "owner_id": user["id"],
        "original_filename": filename,
        "content_type": content_type,
        "size": len(data),
        "folder": folder,
        "is_deleted": False,
        "created_at": now_iso(),
    }

    await db.files.insert_one(doc)

    return {
        "id": doc["id"],
        "storage_path": doc["storage_path"],
        "file_url": doc["file_url"],
        "content_type": doc["content_type"],
        "size": doc["size"],
    }


@router.get("/files/{path:path}")
async def serve_file(path: str):

    record = await db.files.find_one(
        {
            "storage_path": path,
            "is_deleted": False,
        },
        {
            "_id": 0,
        },
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="File not found",
        )

    return RedirectResponse(
        url=record["file_url"]
    )

