from fastapi import APIRouter
import joblib
import random

router = APIRouter()

# Muat model
model = joblib.load("C:\Josephine Work File - 2025\Latsar Aktualisasi\sistem-rekomendasi-saran-pengembangan\model\model_classification_best_tuned.joblib")

# Aspek yang digunakan
aspek_list = ["Pengetahuan", "Keahlian", "Personal Attribute"]

def predict_saran(capaian_nilai: float, gap_kompetensi: float, kompetensi: str):
    prediction = model.predict([[capaian_nilai, gap_kompetensi]])[0]
    hasil = {}
    for aspek in aspek_list:
        hasil[aspek] = [
            f"{kompetensi} - {aspek} - Saran {i+1}: {prediction} {random.choice(['Workshop', 'Pelatihan', 'Coaching'])}"
            for i in range(3)
        ]
    return hasil
