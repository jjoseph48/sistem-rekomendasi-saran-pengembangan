from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal

router = APIRouter(prefix="/superadmin", tags=["Superadmin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication
@router.post("/login")
def superadmin_login(data: dict, db: Session = Depends(get_db)):
    user = db.query(models.UserAdmin).filter(models.UserAdmin.username == data["username"]).first()
    if not user or user.password != data["password"] or user.role != "superadmin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login gagal")
    return {"message": "Login berhasil", "user": {"username": user.username, "role": user.role}}

@router.post("/logout")
def logout():
    return {"message": "Logout berhasil"}

# Admin management
@router.post("/register-admin")
def register_admin(data: dict, db: Session = Depends(get_db)):
    existing = db.query(models.UserAdmin).filter(models.UserAdmin.username == data["username"]).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username sudah terdaftar")
    
    new_admin = models.UserAdmin(username=data["username"], password=data["password"], role="admin")
    
    db.add(new_admin)
    db.commit()
    return {"message": f"Admin '{data['username']}' berhasil ditambahkan"}

@router.delete("/hapus-admin/{admin_id}")
def hapus_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(models.UserAdmin).filter(models.UserAdmin.id == admin_id, models.UserAdmin.role == "admin").first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin tidak ditemukan")
    
    db.delete(admin)
    db.commit()
    return {"message": f"Admin dengan ID {admin_id} berhasil dihapus"}

# Pegawai management
@router.get("/pegawai")
def lihat_semua_pegawai(db: Session = Depends(get_db)):
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

@router.get("/pegawai/{nip}")
def lihat_profil_pegawai(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pegawai tidak ditemukan")
    return {
        "id": pegawai.id,
        "nama": pegawai.nama,
        "nip": pegawai.nip,
        "satker": pegawai.satker,
        "jabatan": pegawai.jabatan,
        "kinerja": pegawai.kinerja
    }

@router.post("/pegawai")
def input_pegawai(data: dict, db: Session = Depends(get_db)):
    existing = db.query(models.Pegawai).filter(models.Pegawai.nip == data["nip"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Pegawai sudah ada.")
    
    new_pegawai = models.Pegawai(
        nama=data["nama"],
        nip=data["nip"],
        satker=data["satker"],
        jabatan=data["jabatan"],
        kinerja=data["kinerja"]
    )
    db.add(new_pegawai)
    db.commit()
    return {"message": f"Pegawai {data['nama']} berhasil ditambahkan."}

@router.put("/pegawai/{nip}")
def edit_pegawai(nip: str, data: dict, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="Pegawai tidak ditemukan.")
    pegawai.nama = data.get("nama", pegawai.nama)
    pegawai.satker = data.get("satker", pegawai.satker)
    pegawai.jabatan = data.get("jabatan", pegawai.jabatan)
    pegawai.kinerja = data.get("kinerja", pegawai.kinerja)
    db.commit()
    return {"message": f"Data pegawai {pegawai.nama} berhasil diperbarui."}

@router.delete("/pegawai/{nip}")
def hapus_pegawai(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="Pegawai tidak ditemukan.")
    db.delete(pegawai)
    db.commit()
    return {"message": f"Data pegawai {pegawai.nama} berhasil dihapus."}

# =====================================================
# 🧾 SARAN PENGEMBANGAN MANAGEMENT
# =====================================================

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
            "tanggal rekomendasi": s.tanggal_rekomendasi,
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
        raise HTTPException(status_code=404, detail="Saran tidak ditemukan.")
    db.delete(saran)
    db.commit()
    return {"message": "Saran pengembangan berhasil dihapus."}