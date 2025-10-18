from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal

router = APIRouter(prefix="/pegawai", tags=["Pegawai"])

# =========================================================
# 📦 Dependency untuk koneksi DB
# =========================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# 👤 GET PROFIL PEGAWAI
# =========================================================
@router.get("/profile/{nip}")
def get_profile(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="Pegawai tidak ditemukan")

    return {
        "nama": pegawai.nama,
        "nip": pegawai.nip,
        "satker": pegawai.satker,
        "jabatan": pegawai.jabatan,
        "kinerja": pegawai.kinerja
    }


# =========================================================
# 📋 GET SARAN BERDASARKAN NIP (Relasi ke Feedback via FK)
# =========================================================
@router.get("/saran/{nip}")
def get_saran_by_nip(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="Pegawai tidak ditemukan.")

    saran_list = (
        db.query(models.SaranPengembangan)
        .filter(models.SaranPengembangan.pegawai_id == pegawai.id)
        .all()
    )

    hasil = []
    for s in saran_list:
        # Ambil feedback via foreign key (bisa None kalau belum ada)
        feedback = None
        if s.feedback_id:
            feedback_obj = db.query(models.Feedback).filter(models.Feedback.id == s.feedback_id).first()
            if feedback_obj:
                feedback = feedback_obj.feedback

        hasil.append({
            "saran_id": s.id,
            "kompetensi": s.kompetensi,
            "aspek_kompetensi": s.aspek_kompetensi,
            "saran_pengembangan": s.saran_pengembangan,
            "feedback": feedback or "Tidak Ada Feedback",
            "feedback_id": s.feedback_id,
            "tanggal_rekomendasi": s.tanggal_rekomendasi,
            "is_selected": s.is_selected
        })

    return {
        "nip": pegawai.nip,
        "nama": pegawai.nama,
        "riwayat_saran": hasil
    }


# =========================================================
# ⭐ PILIH SARAN YANG DIPAKAI PEGAWAI
# =========================================================
@router.put("/saran/select/{saran_id}")
def pilih_saran(saran_id: int, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == saran_id).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran tidak ditemukan")

    # 🔹 Nonaktifkan semua saran lain dengan kompetensi sama, KECUALI yang sedang dipilih
    db.query(models.SaranPengembangan).filter(
        models.SaranPengembangan.pegawai_id == saran.pegawai_id,
        models.SaranPengembangan.kompetensi == saran.kompetensi,
        models.SaranPengembangan.id != saran.id
    ).update({models.SaranPengembangan.is_selected: False})

    # 🔹 Aktifkan saran ini
    saran.is_selected = True
    db.commit()
    db.refresh(saran)

    return {
        "message": f"Saran '{saran.saran_pengembangan}' berhasil dipilih untuk kompetensi {saran.kompetensi}",
        "id": saran.id,
        "kompetensi": saran.kompetensi,
        "aspek_kompetensi": saran.aspek_kompetensi,
        "is_selected": saran.is_selected
    }

# =========================================================
# 💬 UPDATE FEEDBACK PADA SARAN TERTENTU
# =========================================================
@router.put("/saran/feedback/{saran_id}")
def update_feedback(saran_id: int, feedback_id: int, db: Session = Depends(get_db)):
    """
    Pegawai dapat mengubah feedback terhadap saran yang dipilih.
    feedback_id dikirim via query parameter (contoh: ?feedback_id=3)
    """

    # Cari saran berdasarkan ID
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == saran_id).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran tidak ditemukan")

    # Pastikan feedback_id valid
    feedback_obj = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not feedback_obj:
        raise HTTPException(status_code=404, detail="Feedback tidak ditemukan")

    # Update kolom feedback_id
    saran.feedback_id = feedback_id
    db.commit()
    db.refresh(saran)

    return {
        "message": f"Feedback berhasil diubah menjadi '{feedback_obj.feedback}'",
        "saran_id": saran.id,
        "kompetensi": saran.kompetensi,
        "feedback_id": saran.feedback_id,
        "feedback": feedback_obj.feedback
    }

# =========================================================
# 🚪 LOGOUT SEDERHANA
# =========================================================
@router.post("/logout")
def logout_user():
    """Logout sederhana — hanya instruksi untuk frontend agar hapus session."""
    return {"message": "Logout berhasil"}