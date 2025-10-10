from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login_pegawai(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="NIP tidak ditemukan")
    return {"message": "Login berhasil", "nama": pegawai.nama, "nip": pegawai.nip}