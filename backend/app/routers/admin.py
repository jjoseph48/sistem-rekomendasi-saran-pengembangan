from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal   

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication
@router.post("/login")
def admin_login(data: dict, db: Session = Depends(get_db)):
    user = db.query(models.UserAdmin).filter(models.UserAdmin.username == data["username"]).first()
    if not user or user.password != data["password"] or user.role != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login gagal")
    return {"message": "Login berhasil", "user": {"username": user.username, "role": user.role}}

@router.post("/logout")
def logout():
    return {"message": "Logout berhasil"}

# Pegawai view
@router.get("/pegawai")
def lihat_pegawai(db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).all()
    return [
        {
            "id": p.id,
            "nama": p.nama,
            "nip": p.nip,
            "satker": p.satker,
            "jabatan": p.jabatan,
            "kinerja": p.kinerja
        } for p in pegawai
    ]

@router.get("/saran")
def lihat_saran(db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).all()
    return [
        {
            "id": s.id,
            "pegawai_id": s.pegawai_id,
            "kompetensi": s.kompetensi,
            "aspek_kompetensi": s.aspek_kompetensi,
            "saran_pengembangan": s.saran_pengembangan
        } for s in saran
    ]

@router.put("/saran/{id}")
def edit_saran(id: int, data: dict, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == id).first()
    if not saran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saran tidak ditemukan")
    saran.kompetensi = data.get("saran_pengembangan", saran.saran_pengembangan)
    db.commit()
    return {"message": "Saran berhasil diperbarui"}

@router.delete("/saran/{id}")
def hapus_saran(id: int, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == id).first()
    if not saran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saran tidak ditemukan")
    db.delete(saran)
    db.commit()
    return {"message": "Saran berhasil dihapus"}