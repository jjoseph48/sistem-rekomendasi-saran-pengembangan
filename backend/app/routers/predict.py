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
    """
    # Siapkan input untuk model
    input_features = [[standar_level, capaian_nilai, gap]]
    
    # Prediksi utama dari model (misalnya kategori saran)
    prediction = model.predict(input_features)[0]

    # Hasil akhir berupa dict dengan 3 aspek, masing-masing punya 3 saran
    hasil = {}
    for aspek in aspek_list:
        hasil[aspek] = [
            f"{kompetensi} - {aspek} - Saran {i+1}: {prediction} "
            f"{random.choice(['Workshop', 'Pelatihan', 'Coaching'])}. "
            f"(Feedback terakhir: {feedback_terakhir})"
            for i in range(3)
        ]
    return hasil