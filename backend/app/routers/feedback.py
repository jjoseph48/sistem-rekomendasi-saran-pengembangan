from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal

router = APIRouter(prefix="/feedback", tags=["Feedback"])

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
# 📊 1️⃣ Menampilkan Semua Kategori Feedback
# =====================================================
@router.get("/", response_model=list)
def get_all_feedback(db: Session = Depends(get_db)):
    """
    Mengambil daftar semua kategori feedback (misal: Sangat Efektif, Efektif, dst)
    """
    feedbacks = db.query(models.Feedback).order_by(models.Feedback.id.desc()).all()

    if not feedbacks:
        raise HTTPException(status_code=404, detail="Belum ada kategori feedback.")

    return [{"id": fb.id, "feedback": fb.feedback} for fb in feedbacks]