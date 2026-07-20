import os
import uuid
import logging

import cloudinary
import cloudinary.uploader
import cloudinary.api

logger = logging.getLogger(__name__)

APP_NAME = os.getenv("APP_NAME", "RentVerseAI")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

MIME_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "pdf": "application/pdf",
}


def build_path(user_id: str, filename: str, folder: str = "uploads") -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    unique_name = f"{uuid.uuid4()}.{ext}"
    return f"{APP_NAME}/{folder}/{user_id}/{unique_name}"


def content_type_for(
    filename: str,
    fallback: str = "application/octet-stream",
):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return MIME_TYPES.get(ext, fallback)


def put_object(path: str, data: bytes, content_type: str):
    """
    Upload a file to Cloudinary.
    Returns:
    {
        "url": "...",
        "secure_url": "...",
        "public_id": "..."
    }
    """

    try:
        result = cloudinary.uploader.upload(
            data,
            resource_type="auto",
            public_id=path,
            overwrite=False,
        )

        return {
            "url": result["secure_url"],
            "secure_url": result["secure_url"],
            "public_id": result["public_id"],
        }

    except Exception as e:
        logger.exception("Cloudinary upload failed: %s", e)
        raise


def get_object(public_id: str):
    """
    Get Cloudinary object URL.
    """

    try:
        url = cloudinary.CloudinaryImage(public_id).build_url(
            secure=True
        )

        return {
            "url": url,
            "public_id": public_id,
        }

    except Exception as e:
        logger.exception("Cloudinary fetch failed: %s", e)
        raise


def delete_object(public_id: str):
    """
    Delete file from Cloudinary.
    """

    try:
        result = cloudinary.uploader.destroy(public_id)
        return result

    except Exception as e:
        logger.exception("Cloudinary delete failed: %s", e)
        raise


def init_storage():
    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        logger.warning("CLOUDINARY_CLOUD_NAME is not configured.")

    if not os.getenv("CLOUDINARY_API_KEY"):
        logger.warning("CLOUDINARY_API_KEY is not configured.")

    if not os.getenv("CLOUDINARY_API_SECRET"):
        logger.warning("CLOUDINARY_API_SECRET is not configured.")

    logger.info("Cloudinary storage initialized successfully.")

    return True