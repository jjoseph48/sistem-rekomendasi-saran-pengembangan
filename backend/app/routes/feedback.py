from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/feedback")
def add_feedback(data: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    fb = crud.create_feedback(db, data.saran_id, data.feedback)
    return {"message": "Feedback disimpan", "id": fb.id}