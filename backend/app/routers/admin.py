from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal

router = APIRouter(prefix="/admin", tags=["Admin"])


# =====================================================
# 🔧 Dependency Database
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🔐 Authentication
# =====================================================
@router.post("/login")
def admin_login(data: dict, db: Session = Depends(get_db)):
    user = db.query(models.UserAdmin).filter(models.UserAdmin.username == data["username"]).first()
    if not user or user.password != data["password"] or user.role != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login gagal")
    return {"message": "Login berhasil", "user": {"username": user.username, "role": user.role}}


@router.post("/logout")
def logout():
    return {"message": "Logout berhasil"}


# =====================================================
# 👥 Pegawai View
# =====================================================
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
        }
        for p in pegawai
    ]


# =====================================================
# 🧩 Saran Pengembangan View (Relasi feedback_id → Feedback)
# =====================================================
@router.get("/saran")
def lihat_saran(db: Session = Depends(get_db)):
    """
    Menampilkan semua saran pengembangan + nama pegawai + feedback terkait (via FK).
    """
    saran_list = db.query(models.SaranPengembangan).all()
    hasil = []

    for s in saran_list:
        pegawai = db.query(models.Pegawai).filter(models.Pegawai.id == s.pegawai_id).first()
        feedback_text = None

        # Ambil feedback dari relasi langsung
        if s.feedback_id:
            feedback_obj = db.query(models.Feedback).filter(models.Feedback.id == s.feedback_id).first()
            if feedback_obj:
                feedback_text = feedback_obj.feedback

        hasil.append({
            "id": s.id,
            "nama_pegawai": pegawai.nama if pegawai else "-",
            "nip": pegawai.nip if pegawai else "-",
            "kompetensi": s.kompetensi,
            "aspek_kompetensi": s.aspek_kompetensi,
            "saran_pengembangan": s.saran_pengembangan,
            "tanggal_rekomendasi": s.tanggal_rekomendasi,
            "feedback": feedback_text or "Tidak ada feedback",
            "feedback_id": s.feedback_id,
            "is_selected": s.is_selected
        })

    return hasil


# =====================================================
# ✏️ Update Saran oleh Admin
# =====================================================
@router.put("/saran/{saran_id}")
def update_saran_by_id(saran_id: int, data: schemas.EditSaran, db: Session = Depends(get_db)):
    """
    Admin mengedit teks saran pengembangan berdasarkan ID saran.
    Feedback tidak diubah dari sini.
    """
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == saran_id).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran pengembangan tidak ditemukan")

    saran.saran_pengembangan = data.saran_pengembangan
    db.commit()
    db.refresh(saran)

    pegawai = db.query(models.Pegawai).filter(models.Pegawai.id == saran.pegawai_id).first()

    return {
        "message": "✅ Saran pengembangan berhasil diperbarui",
        "data": {
            "id": saran.id,
            "nama_pegawai": pegawai.nama if pegawai else "-",
            "nip": pegawai.nip if pegawai else "-",
            "kompetensi": saran.kompetensi,
            "aspek_kompetensi": saran.aspek_kompetensi,
            "saran_pengembangan": saran.saran_pengembangan,
            "is_selected": saran.is_selected
        }
    }


# =====================================================
# 🗑️ Hapus Saran
# =====================================================
@router.delete("/saran/{id}")
def hapus_saran(id: int, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == id).first()
    if not saran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saran tidak ditemukan")

    db.delete(saran)
    db.commit()
    return {"message": f"Saran dengan ID {id} berhasil dihapus"}


# =====================================================
# 🔄 Update Feedback oleh Admin
# =====================================================
@router.put("/feedback/{feedback_id}")
def update_feedback_by_id(feedback_id: int, data: dict, db: Session = Depends(get_db)):
    """
    Admin mengedit feedback berdasarkan ID feedback.
    Data dikirim dalam bentuk:
    {
        "feedback": "Teks feedback baru"
    }
    """
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback tidak ditemukan")

    if "feedback" not in data or not data["feedback"]:
        raise HTTPException(status_code=400, detail="Field 'feedback' wajib diisi")

    feedback.feedback = data["feedback"]
    db.commit()
    db.refresh(feedback)

    # Ambil informasi pegawai dan saran terkait
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.feedback_id == feedback.id).first()
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.id == saran.pegawai_id).first() if saran else None

    return {
        "message": "✅ Feedback berhasil diperbarui",
        "data": {
            "id_feedback": feedback.id,
            "nama_pegawai": pegawai.nama if pegawai else "-",
            "nip": pegawai.nip if pegawai else "-",
            "saran_pengembangan": saran.saran_pengembangan if saran else "-",
            "feedback_baru": feedback.feedback
        }
    }