import joblib
import random

# Muat model
model = joblib.load("./model/model_classification_best_tuned.joblib")

# Aspek yang digunakan
aspek_list = ["Pengetahuan", "Keahlian", "Personal Attribute"]

def get_saran_pengembangan(capaian_nilai, gap_kompetensi, kompetensi):
    """
    Menghasilkan 3 saran pengembangan untuk tiap aspek berdasarkan hasil prediksi model.
    """
    # Prediksi utama model
    prediction = model.predict([[capaian_nilai, gap_kompetensi]])[0]

    # Contoh hasil dummy
    hasil = {}
    for aspek in aspek_list:
        hasil[aspek] = [
            f"{kompetensi} - {aspek} - Saran {i+1}: {prediction} {random.choice(['Workshop', 'Pelatihan', 'Coaching'])}"
            for i in range(3)
        ]
    return hasil