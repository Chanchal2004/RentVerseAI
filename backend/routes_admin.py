"""Admin panel routes for RentVerse AI."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from models import AdminActionRequest, now_iso
from deps import db, require_role


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role("admin"))],
)


# --------------------------------------------------
# ADMIN DASHBOARD STATISTICS
# --------------------------------------------------

@router.get("/stats")
async def stats():
    users = await db.users.count_documents({})
    owners = await db.users.count_documents({"role": "owner"})
    tenants = await db.users.count_documents({"role": "tenant"})

    total_props = await db.properties.count_documents({})
    pending = await db.properties.count_documents({"status": "pending"})
    approved = await db.properties.count_documents({"status": "approved"})
    rejected = await db.properties.count_documents({"status": "rejected"})
    suspended = await db.properties.count_documents({"status": "suspended"})

    kyc_pending = await db.kyc.count_documents({"status": "pending"})
    paid = await db.payments.count_documents({"status": "paid"})

    revenue_agg = await db.payments.aggregate([
        {"$match": {"status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]).to_list(1)

    revenue = revenue_agg[0]["total"] if revenue_agg else 0

    return {
        "users": users,
        "owners": owners,
        "tenants": tenants,
        "properties": {
            "total": total_props,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "suspended": suspended,
        },
        "kyc_pending": kyc_pending,
        "payments": paid,
        "revenue_paise": revenue,
    }


# --------------------------------------------------
# LIST ALL PROPERTIES
# --------------------------------------------------

@router.get("/properties")
async def list_all_properties(
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=200),
):
    query = {}

    if status:
        allowed_statuses = {
            "pending",
            "approved",
            "rejected",
            "suspended",
            "needs_info",
        }

        if status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid property status",
            )

        query["status"] = status

    properties = await db.properties.find(
        query,
        {"_id": 0},
    ).sort(
        "created_at", -1
    ).limit(limit).to_list(limit)

    return properties


# --------------------------------------------------
# APPROVE / REJECT / SUSPEND PROPERTY
# --------------------------------------------------

@router.post("/properties/{prop_id}/action")
async def property_action(
    prop_id: str,
    payload: AdminActionRequest,
    admin=Depends(require_role("admin")),
):
    property_doc = await db.properties.find_one({"id": prop_id})

    if not property_doc:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    status_map = {
        "approve": "approved",
        "reject": "rejected",
        "suspend": "suspended",
        "request_info": "needs_info",
    }

    action = payload.action

    if action not in status_map:
        raise HTTPException(
            status_code=400,
            detail="Invalid action",
        )

    new_status = status_map[action]
    timestamp = now_iso()

    await db.properties.update_one(
        {"id": prop_id},
        {
            "$set": {
                "status": new_status,
                "admin_note": payload.note,
                "reviewed_by": admin["id"],
                "reviewed_at": timestamp,
                "updated_at": timestamp,
            }
        },
    )

    return {
        "ok": True,
        "property_id": prop_id,
        "status": new_status,
    }


# --------------------------------------------------
# DELETE PROPERTY
# --------------------------------------------------

@router.delete("/properties/{prop_id}")
async def delete_property(
    prop_id: str,
    admin=Depends(require_role("admin")),
):
    property_doc = await db.properties.find_one({"id": prop_id})

    if not property_doc:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    result = await db.properties.delete_one({"id": prop_id})

    if result.deleted_count != 1:
        raise HTTPException(
            status_code=500,
            detail="Property could not be deleted",
        )

    return {
        "ok": True,
        "message": "Property deleted successfully",
        "property_id": prop_id,
    }


# --------------------------------------------------
# LIST KYC SUBMISSIONS
# --------------------------------------------------

@router.get("/kyc")
async def list_kyc(status: Optional[str] = None):
    query = {}

    if status:
        query["status"] = status

    submissions = await db.kyc.find(
        query,
        {"_id": 0},
    ).sort(
        "submitted_at", -1
    ).limit(200).to_list(200)

    return submissions


# --------------------------------------------------
# APPROVE / REJECT KYC
# --------------------------------------------------

@router.post("/kyc/{kyc_id}/action")
async def kyc_action(
    kyc_id: str,
    payload: AdminActionRequest,
    admin=Depends(require_role("admin")),
):
    kyc_doc = await db.kyc.find_one({"id": kyc_id})

    if not kyc_doc:
        raise HTTPException(
            status_code=404,
            detail="KYC submission not found",
        )

    if payload.action not in {"approve", "reject"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid KYC action",
        )

    new_status = (
        "approved"
        if payload.action == "approve"
        else "rejected"
    )

    timestamp = now_iso()

    await db.kyc.update_one(
        {"id": kyc_id},
        {
            "$set": {
                "status": new_status,
                "reviewer_note": payload.note,
                "reviewed_at": timestamp,
                "reviewer_id": admin["id"],
            }
        },
    )

    await db.users.update_one(
        {"id": kyc_doc["user_id"]},
        {
            "$set": {
                "kyc_status": new_status,
            }
        },
    )

    return {
        "ok": True,
        "kyc_id": kyc_id,
        "status": new_status,
    }


# --------------------------------------------------
# LIST USERS
# --------------------------------------------------

@router.get("/users")
async def list_users(role: Optional[str] = None):
    query = {}

    if role:
        allowed_roles = {"admin", "owner", "tenant"}

        if role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail="Invalid user role",
            )

        query["role"] = role

    users = await db.users.find(
        query,
        {
            "_id": 0,
            "password_hash": 0,
        },
    ).sort(
        "created_at", -1
    ).limit(500).to_list(500)

    return users


# --------------------------------------------------
# LIST PAYMENTS
# --------------------------------------------------

@router.get("/payments")
async def list_payments(status: Optional[str] = None):
    query = {}

    if status:
        query["status"] = status

    payments = await db.payments.find(
        query,
        {"_id": 0},
    ).sort(
        "created_at", -1
    ).limit(200).to_list(200)

    return payments
