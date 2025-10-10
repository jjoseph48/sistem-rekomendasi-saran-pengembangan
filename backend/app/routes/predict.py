from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import joblib
import os
from app import crud, schemas, models
from app.database import SessionLocal

router = APIRouter()
model_path = os.path.join(os.path.dirname(__file__), "../ml/model.joblib")
model = joblib.load(model_path)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 Simulasi fungsi model (dummy)
def get_saran_pengembangan(input_data):
    # Di sini kamu bisa pakai logika model aslimu.
    # Misal model memprediksi satu saran, tapi kita ingin 3 per aspek
    aspek_list = ["Pengetahuan", "Keahlian", "Personal Attribute"]
    all_saran = {}
    for aspek in aspek_list:
        # Contoh prediksi sederhana
        # Bisa disesuaikan dengan output real model kamu
        X = [[
            input_data.level_kompetensi,
            input_data.capaian_nilai,
            input_data.gap_kompetensi
        ]]
        pred = model.predict(X)
        # Simulasikan 3 variasi saran untuk tiap aspek
        base = str(pred[0])
        all_saran[aspek] = [
            f"{base} ({aspek}) - 1",
            f"{base} ({aspek}) - 2",
            f"{base} ({aspek}) - 3"
        ]
    return all_saran


@router.post("/predict")
def predict_saran(input_data: schemas.PredictInput, db: Session = Depends(get_db)):
    """
    Menghasilkan 9 saran pengembangan total:
    - 3 saran Pengetahuan
    - 3 saran Keahlian
    - 3 saran Personal Attribute
    """
    # Panggil model
    hasil_saran = get_saran_pengembangan(input_data)

    # Simpan ke DB (satu record per aspek)
    aspek_records = []
    for aspek, daftar_saran in hasil_saran.items():
        for saran in daftar_saran:
            obj = crud.create_saran(
                db,
                pegawai_id=1,  # nanti bisa diambil dari sesi login (nip)
                saran=saran
            )
            aspek_records.append(saran)

    return {
        "kompetensi": input_data.kompetensi,
        "saran_pengembangan": hasil_saran
    }