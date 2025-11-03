from sqlalchemy.orm import Session
from . import models, schemas

# crud.py di proyek FastAPI ini berfungsi sebagai lapisan logika database di antara router dan model

def get_or_create_pegawai(db: Session, nip: str, data: schemas.PegawaiCreate):
    # mengecek apakah pegawai dengan nip tertentu sudah ada
    # kalau belum ada, otomatis buat baru
    # mengembalikan instance Pegawai
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if pegawai:
        return pegawai
    # saat membuat pegawai baru, field kompetensi akan ikut dikirim di data.dict()
    # tapi models.Pegawai tidak punyak kolom bernama kompetensi - hanya relasi ORM
    new_pegawai = models.Pegawai(**data.dict())
    db.add(new_pegawai)
    db.commit()
    db.refresh(new_pegawai)
    return new_pegawai

def create_saran(db: Session, pegawai_id: int, saran: str):
    # membuat entri baru di tabel saran_pengembangan
    new_saran = models.SaranPengembangan(pegawai_id=pegawai_id, saran_pengembangan=saran)
    db.add(new_saran)
    db.commit()
    db.refresh(new_saran)
    return new_saran

def create_feedback(db: Session, saran_id: int, feedback: str):
    fb = models.Feedback(saran_id=saran_id, feedback=feedback)
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb