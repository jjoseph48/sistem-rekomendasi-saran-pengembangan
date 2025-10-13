from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal
from app.routers.predict import predict_saran

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register_pegawai(data: dict, db: Session = Depends(get_db)):
    existing = db.query(models.Pegawai).filter(models.Pegawai.nip == data["nip"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Pegawai sudah terdaftar.")

    # 🔹 Simpan data pegawai termasuk kinerja
    pegawai = models.Pegawai(
        nama=data["nama"],
        nip=data["nip"],
        satker=data["satker"],
        jabatan=data["jabatan"],
        kinerja=data["kinerja"]
    )
    db.add(pegawai)
    db.commit()
    db.refresh(pegawai)

    # 🔹 Simpan nilai kompetensi dan buat saran otomatis
    for item in data["kompetensi"]:
        komp = models.KompetensiPegawai(
            pegawai_id=pegawai.id,
            nama_kompetensi=item["nama_kompetensi"],
            capaian_nilai=item["capaian_nilai"],
            gap_kompetensi=item["gap_kompetensi"]
        )
        db.add(komp)
        db.commit()

        # 🔹 Panggil model ML untuk saran pengembangan
        saran_hasil = predict_saran(
            item["capaian_nilai"],
            item["gap_kompetensi"],
            item["nama_kompetensi"]
        )
        for aspek, daftar_saran in saran_hasil.items():
            for s in daftar_saran:
                record = models.SaranPengembangan(
                    pegawai_id=pegawai.id,
                    kompetensi=item["nama_kompetensi"],
                    aspek_kompetensi=aspek,
                    saran_pengembangan=s
                )
                db.add(record)
    db.commit()

    return {
        "message": "Registrasi berhasil",
        "nama": pegawai.nama,
        "nip": pegawai.nip,
        "total_kompetensi": len(data["kompetensi"])
    }

@router.post("/login")
def login_pegawai(nip: str, db: Session = Depends(get_db)):
    pegawai = db.query(models.Pegawai).filter(models.Pegawai.nip == nip).first()
    if not pegawai:
        raise HTTPException(status_code=404, detail="NIP tidak ditemukan, silakan register.")
    return {
        "message": "Login berhasil",
        "nama": pegawai.nama,
        "nip": pegawai.nip,
        "satker": pegawai.satker,
        "jabatan": pegawai.jabatan,
        "kinerja": pegawai.kinerja  # 🔹 tambahan baru
    }