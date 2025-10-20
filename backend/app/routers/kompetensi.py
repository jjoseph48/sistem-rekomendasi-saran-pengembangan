from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests
from app import models
from app.database import SessionLocal

router = APIRouter(prefix="/kompetensi", tags=["Kompetensi"])

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
# 🧾 GET: Daftar Kompetensi Pegawai
# =========================================================
@router.get("/{nip}")
def get_kompetensi_by_nip(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="Pegawai tidak ditemukan")

    kompetensi_list = db.query(models.KompetensiPegawai).filter(models.KompetensiPegawai.pegawai_id == pegawai.id).all()
    if not kompetensi_list:
        return {"message": "Belum ada data kompetensi"}

    hasil = [
        {
            "id": k.id,
            "kompetensi": k.nama_kompetensi,
            "standar_level": k.standar_level,
            "capaian_nilai": k.capaian_nilai,
            "gap": k.gap_kompetensi,
        }
        for k in kompetensi_list
    ]
    return {"nip": pegawai.nip, "nama": pegawai.nama, "kompetensi": hasil}

# =========================================================
# ✏️ PUT: Ubah Kompetensi + Panggil Model ML
# =========================================================
@router.put("/{kompetensi_id}")
def update_kompetensi(
    kompetensi_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    try:
        komp = db.query(models.KompetensiPegawai).filter(models.KompetensiPegawai.id == kompetensi_id).first()
        if not komp:
            raise HTTPException(status_code=404, detail="Data kompetensi tidak ditemukan")

        komp.standar_level = data.get("standar_level", komp.standar_level)
        komp.capaian_nilai = data.get("capaian_nilai", komp.capaian_nilai)
        komp.gap_kompetensi = data.get("gap", komp.gap_kompetensi)
        db.commit()
        db.refresh(komp)

        # Ambil feedback terakhir dari saran sebelumnya
        feedback_terakhir = (
            db.query(models.Feedback.feedback)
            .join(models.SaranPengembangan, models.SaranPengembangan.feedback_id == models.Feedback.id)
            .filter(models.SaranPengembangan.pegawai_id == komp.pegawai_id)
            .order_by(models.SaranPengembangan.id.desc())
            .first()
        )
        feedback_terakhir = feedback_terakhir[0] if feedback_terakhir else "tidak ada"

        print("✅ UPDATE KOMPETENSI BERHASIL")
        print("➡️ Kompetensi:", komp.nama_kompetensi)
        print("➡️ Feedback terakhir:", feedback_terakhir)

        return {"message": "Data kompetensi berhasil diperbarui", "feedback_terakhir": feedback_terakhir}

    except Exception as e:
        import traceback
        print("❌ ERROR UPDATE KOMPETENSI:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))