from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
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
            "saran_pengembangan": s.saran_pengembangan,
            "tanggal_rekomendasi": s.tanggal_rekomendasi,
            "feedback_terakhir": s.feedback_terakhir,
            "is_selected": s.is_selected  
        } for s in saran
    ]

@router.put("/{saran_id}")
def update_saran_by_id(saran_id: int, data: schemas.EditSaran, db: Session = Depends(get_db)):
    """
    Edit satu saran pengembangan berdasarkan ID saran.
    """
    # Cari data saran di database
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == saran_id).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran pengembangan tidak ditemukan")

    # Update field yang diizinkan
    saran.saran_pengembangan = data.saran_pengembangan
    saran.feedback_terakhir = data.feedback_terakhir

    db.commit()
    db.refresh(saran)

    return {
        "message": "✅ Saran pengembangan berhasil diperbarui",
        "data": {
            "id": saran.id,
            "nip": saran.pegawai.nip,
            "kompetensi": saran.kompetensi,
            "aspek_kompetensi": saran.aspek_kompetensi,
            "saran_pengembangan": saran.saran_pengembangan,
            "feedback_terakhir": saran.feedback_terakhir,
        }
    }

@router.delete("/saran/{id}")
def hapus_saran(id: int, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == id).first()
    if not saran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saran tidak ditemukan")
    db.delete(saran)
    db.commit()
    return {"message": "Saran berhasil dihapus"}