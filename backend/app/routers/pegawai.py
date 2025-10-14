from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal

router = APIRouter(prefix="/pegawai", tags=["Pegawai"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/saran")
def get_saran_by_nip(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="Pegawai tidak ditemukan.")

    saran_list = db.query(models.SaranPengembangan)\
        .filter(models.SaranPengembangan.pegawai_id == pegawai.id).all()

    hasil = []
    for s in saran_list:
        last_fb = None
        if s.feedbacks:
            last_fb = s.feedbacks[-1].feedback
        hasil.append({
            "kompetensi": s.kompetensi,
            "aspek_kompetensi": s.aspek_kompetensi,
            "saran_pengembangan": s.saran_pengembangan,
            "feedback_terakhir": last_fb
        })
    return {"nip": pegawai.nip, "nama": pegawai.nama, "riwayat_saran": hasil}


@router.post("/feedback")
def submit_feedback(data: dict, db: Session = Depends(get_db)):
    saran = db.query(models.SaranPengembangan).filter(models.SaranPengembangan.id == data["saran_id"]).first()
    if not saran:
        raise HTTPException(status_code=404, detail="Saran tidak ditemukan.")

    fb = models.Feedback(saran_id=saran.id, feedback=data["feedback"])
    db.add(fb)
    db.commit()
    return {"message": "Feedback berhasil disimpan", "feedback": fb.feedback}