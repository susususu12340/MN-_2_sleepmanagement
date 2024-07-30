from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from passlib.context import CryptContext

from api.schemas.group import *
from api.schemas.userdata import *
from api.routers.userdata import *
from api.database import SessionLocal, engine, Base


router = APIRouter()
router.groups = None
sleep_data_db = []
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create_group/", response_model=Group)
async def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(group.hashed_password)
    db_group = GroupInDB(
        group_name=group.group_name,
        hashed_password=hashed_password
    )
    
    # Add the creator user to the group
    #  current_user: User = Depends(get_current_active_user)
    user_in_groupDB_me = db.query(User_InGroupDB).filter(and_(User_InGroupDB.user_id == group.user_id)).all()

    if user_in_groupDB_me:
        for user in user_in_groupDB_me:
            db_group.users.append(user)
    else:
        db_group.users.append(User_InGroupDB(user_id=group.user_id, username=group.username))
    
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    return db_group

@router.post("/move_group/", response_model=Group)
def move_group(group: GroupMove, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    db_group = db.query(GroupInDB).filter(GroupInDB.group_name == group.group_name).first()

    print(current_user.id)
    print(current_user.username)
    
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")

    if not pwd_context.verify(group.hashed_password, db_group.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid group password")
        
    user_exists = any(user.user_id == current_user.id and user.username == current_user.username for user in db_group.users)
    
    if not user_exists:
        new_member = User_InGroupDB(user_id=current_user.id, username=current_user.username)
        db_group.users.append(new_member)
        db.add(new_member)
        db.commit()
        db.refresh(db_group)
    
    return db_group


@router.get("/group_users/{group_id}", response_model=List[UserRead])
def get_group_users(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    print(current_user.id)
    print(current_user.username)
    db_group = db.query(GroupInDB).filter(GroupInDB.id == group_id).first()

    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    user_exists = any(user.user_id == current_user.id and user.username == current_user.username for user in db_group.users)
    
    if not user_exists:
        raise HTTPException(status_code=403, detail="User is not a member of the group")

    return [UserRead(id=user.id, username=user.username) for user in db_group.users]

