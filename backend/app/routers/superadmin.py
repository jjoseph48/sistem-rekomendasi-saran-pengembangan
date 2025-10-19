from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal

router = APIRouter(prefix="/superadmin", tags=["Superadmin"])

# =====================================================
# 🔌 Dependency untuk koneksi DB
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🔐 AUTHENTICATION
# =====================================================
@router.post("/login")
def superadmin_login(data: dict, db: Session = Depends(get_db)):
    user = db.query(models.UserAdmin).filter(models.UserAdmin.username == data["username"]).first()
    if not user or user.password != data["password"] or user.role != "superadmin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login gagal")
    return {"message": "Login berhasil", "user": {"username": user.username, "role": user.role}}


@router.post("/logout")
def logout_admin():
    return {"message": "Logout berhasil"}


# =====================================================
# 👥 ADMIN MANAGEMENT
# =====================================================
@router.get("/admin")
def get_all_admin(db: Session = Depends(get_db)):
    """
    Menampilkan seluruh akun admin yang terdaftar.
    """
    admins = db.query(models.UserAdmin).filter(models.UserAdmin.role == "admin").all()
    return [
        {
            "id": a.id,
            "username": a.username,
            "role": a.role
        }
        for a in admins
    ]


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

# =====================================================
# 👤 PEGAWAI MANAGEMENT (READ + DELETE SAJA)
# =====================================================
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
    """
    Menampilkan seluruh saran pengembangan pegawai beserta kategori feedback-nya.
    """
    saran_list = db.query(models.SaranPengembangan).all()
    hasil = []
    for s in saran_list:
        feedback_label = "-"
        if s.feedback_id:
            feedback_obj = db.query(models.Feedback).filter(models.Feedback.id == s.feedback_id).first()
            if feedback_obj:
                feedback_label = feedback_obj.feedback

        pegawai = db.query(models.Pegawai).filter(models.Pegawai.id == s.pegawai_id).first()

        hasil.append({
            "id": s.id,
            "nama_pegawai": pegawai.nama if pegawai else "-",
            "nip": pegawai.nip if pegawai else "-",
            "kompetensi": s.kompetensi,
            "aspek_kompetensi": s.aspek_kompetensi,
            "saran_pengembangan": s.saran_pengembangan,
            "tanggal_rekomendasi": s.tanggal_rekomendasi,
            "feedback_kategori": feedback_label,
            "feedback_id": s.feedback_id,
            "is_selected": s.is_selected
        })
    return hasil


@router.put("/saran/{saran_id}")
def update_saran_by_id(saran_id: int, data: dict, db: Session = Depends(get_db)):
    """
    Superadmin dapat mengedit teks saran dan/atau mengubah feedback_id.
    """
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == saran_id).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran pengembangan tidak ditemukan")

    if "saran_pengembangan" in data:
        saran.saran_pengembangan = data["saran_pengembangan"]

    if "feedback_id" in data:
        feedback_obj = db.query(models.Feedback).filter(models.Feedback.id == data["feedback_id"]).first()
        if not feedback_obj:
            raise HTTPException(status_code=404, detail="Feedback tidak ditemukan")
        saran.feedback_id = data["feedback_id"]

    db.commit()
    db.refresh(saran)
    return {"message": "✅ Saran berhasil diperbarui", "id": saran.id, "feedback_id": saran.feedback_id}


@router.delete("/saran/{id}")
def hapus_saran(id: int, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == id).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran tidak ditemukan.")
    db.delete(saran)
    db.commit()
    return {"message": "Saran pengembangan berhasil dihapus."}