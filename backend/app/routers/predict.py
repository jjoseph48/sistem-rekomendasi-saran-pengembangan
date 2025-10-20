# app/routers/predict.py
import pandas as pd
import joblib
from fastapi import APIRouter

router = APIRouter()
clf_model = joblib.load("./model/model_classification_best_tuned_linux.joblib")

aspek_list = ["Pengetahuan", "Keahlian", "Personal Attribute"]

def predict_saran(kompetensi, standar_level, capaian_nilai, gap, feedback_terakhir):
    hasil = {}

    for aspek in aspek_list:
        # Pastikan format aspek sesuai dengan model training (huruf kecil)
        aspek_input = aspek.lower()

        # Buat DataFrame sesuai fitur training
        input_df = pd.DataFrame([{
            "kompetensi": kompetensi.lower(),
            "standar level": standar_level,
            "nilai": capaian_nilai,
            "gap": gap,
            "aspek": aspek_input,
            "feedback_terakhir": feedback_terakhir.lower()
        }])

        # Prediksi probabilitas
        proba = clf_model.predict_proba(input_df)[0]
        classes = clf_model.named_steps["model"].classes_

        # Hitung skor
        scores = {classes[i]: proba[i] for i in range(len(classes))}
        top_rekom = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]

        hasil[aspek] = [saran for saran, score in top_rekom]

    return hasil


@router.post("/predict")
def predict_api(data: dict):
    hasil = predict_saran(
        data["kompetensi"],
        data["standar_level"],
        data["capaian_nilai"],
        data["gap"],
        data.get("feedback_terakhir", "tidak ada")
    )
    return {"hasil_rekomendasi": hasil}