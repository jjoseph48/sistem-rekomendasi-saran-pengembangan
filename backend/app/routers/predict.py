# app/routers/predict.py
import joblib
import random
from fastapi import APIRouter

router = APIRouter()

# 🔹 Muat model joblib
model = joblib.load("./model/model_classification_best_tuned.joblib")

# 🔹 Daftar aspek yang berlaku
aspek_list = ["Pengetahuan", "Keahlian", "Personal Attribute"]

def predict_saran(kompetensi, standar_level, capaian_nilai, gap, feedback_terakhir):
    """
    Menghasilkan 9 saran pengembangan (3 untuk tiap aspek).
    Input features model:
        [kompetensi, standar_level, capaian_nilai, gap, aspek, feedback_terakhir]
    """
    aspek_list = ["Pengetahuan", "Keahlian", "Personal Attribute"]
    hasil = {}

    for aspek in aspek_list:
        # Buat input fitur untuk tiap aspek
        input_features = [[kompetensi, standar_level, capaian_nilai, gap, aspek, feedback_terakhir]]
        
        # 🔹 Prediksi dari model
        try:
            prediction = model.predict(input_features)[0]
        except Exception:
            # fallback dummy kalau model belum siap untuk input string
            prediction = "Rekomendasi umum"

        # 🔹 Buat 3 saran untuk tiap aspek
        hasil[aspek] = [
            f"{kompetensi} - {aspek} - Saran {i+1}: {prediction} "
            f"{random.choice(['Workshop', 'Pelatihan', 'Coaching'])}. "
            for i in range(3)
        ]
    
    return hasil