from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal
from datetime import datetime

router = APIRouter(prefix="/feedback", tags=["Feedback"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =====================================================
# 🧠 Pegawai Memberikan Feedback
# =====================================================
@router.post("/", response_model=dict)
def kirim_feedback(data: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == data.saran_id).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran pengembangan tidak ditemukan.")

    # Cek apakah pegawai sudah pernah memberi feedback untuk saran ini
    existing = db.query(models.Feedback).filter(
        models.Feedback.saran_id == data.saran_id,
        models.Feedback.nip == data.nip
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Pegawai sudah memberikan feedback untuk saran ini.")

    feedback = models.Feedback(
        saran_id=data.saran_id,
        nip=data.nip,
        feedback=data.feedback,
        tanggal_feedback=datetime.utcnow()
    )
    db.add(feedback)
    db.commit()

    return {"message": "Feedback berhasil disimpan."}

# =====================================================
# 📜 Melihat Feedback Berdasarkan Pegawai (NIP)
# =====================================================
@router.get("/{nip}", response_model=list)
def lihat_feedback_pegawai(nip: str, db: Session = Depends(get_db)):
    feedbacks = db.query(models.Feedback).filter(models.Feedback.nip == nip).all()
    if not feedbacks:
        raise HTTPException(status_code=404, detail="Belum ada feedback dari pegawai ini.")

    hasil = []
    for fb in feedbacks:
        saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == fb.saran_id).first()
        hasil.append({
            "saran_id": fb.saran_id,
            "kompetensi": saran.kompetensi if saran else "-",
            "aspek_kompetensi": saran.aspek_kompetensi if saran else "-",
            "saran_pengembangan": saran.saran_pengembangan if saran else "-",
            "feedback": fb.feedback,
            "tanggal_feedback": fb.tanggal_feedback
        })
    return hasil

# =====================================================
# 📊 Admin / Superadmin Melihat Semua Feedback
# =====================================================
@router.get("/", response_model=list)
def semua_feedback(db: Session = Depends(get_db)):
    feedbacks = db.query(models.Feedback).all()
    hasil = []
    for fb in feedbacks:
        saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == fb.saran_id).first()
        hasil.append({
            "id": fb.id,
            "nip": fb.nip,
            "kompetensi": saran.kompetensi if saran else "-",
            "aspek_kompetensi": saran.aspek_kompetensi if saran else "-",
            "saran_pengembangan": saran.saran_pengembangan if saran else "-",
            "feedback": fb.feedback,
            "tanggal_feedback": fb.tanggal_feedback
        })
    return hasil