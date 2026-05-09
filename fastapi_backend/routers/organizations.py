from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from db.database import get_session
from db.models import Organization
from schemas.organizations import OrganizationUpdateRequest

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("")
async def get_organizations(db: AsyncSession = Depends(get_session)):
    query = select(Organization).options(
        selectinload(Organization.tasks),
        selectinload(Organization.reviews)
    )
    orgs = (await db.execute(query)).scalars().all()
    
    result = []
    for o in orgs:
        avg_rating = round(sum(r.rating for r in o.reviews) / len(o.reviews), 1) if o.reviews else 0
        result.append({
            "id": o.id,
            "name": o.name,
            "email": o.email,
            "phone_number": o.phone_number,
            "logo_url": o.logo_url,
            "banner_url": o.banner_url,
            "description": o.description,
            "created_at": o.created_at,
            "task_count": len(o.tasks),
            "average_rating": avg_rating,
            "review_count": len(o.reviews)
        })
    return result

@router.get("/{org_id}")
async def get_organization(org_id: int, db: AsyncSession = Depends(get_session)):
    query = select(Organization).where(Organization.id == org_id).options(
        selectinload(Organization.tasks),
        selectinload(Organization.reviews)
    )
    org = (await db.execute(query)).scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=404, detail={"message": "Organization not found"})

    avg_rating = round(sum(r.rating for r in org.reviews) / len(org.reviews), 1) if org.reviews else 0
    return {
        "id": org.id,
        "name": org.name,
        "email": org.email,
        "phone_number": org.phone_number,
        "logo_url": org.logo_url,
        "banner_url": org.banner_url,
        "description": org.description,
        "created_at": org.created_at,
        "task_count": len(org.tasks),
        "average_rating": avg_rating,
        "review_count": len(org.reviews),
        "tasks": [{"id": t.id, "title": t.title, "description": t.description, "status": t.status, "start_date": t.start_date, "end_date": t.end_date, "max_volunteers": t.max_volunteers} for t in org.tasks]
    }

@router.put("/{org_id}")
async def update_organization(org_id: int, input_data: OrganizationUpdateRequest, db: AsyncSession = Depends(get_session)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail={"message": "Organization not found"})

    org.name = input_data.name
    org.phone_number = input_data.phone_number
    org.logo_url = input_data.logo_url
    org.banner_url = input_data.banner_url
    org.description = input_data.description

    await db.commit()
    await db.refresh(org)
    return org

@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(org_id: int, db: AsyncSession = Depends(get_session)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail={"message": "Organization not found"})

    await db.delete(org)
    await db.commit()
    return None
