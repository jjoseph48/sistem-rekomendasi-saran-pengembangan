# === 1. Import library ===
import pandas as pd
from joblib import load

# === 2. Path model lokal ===
MODEL_PATH = "C:\Josephine Work File - 2025\Latsar Aktualisasi\sistem-rekomendasi-saran-pengembangan\model\model_classification_best_tuned.joblib"  # ubah sesuai lokasi file kamu

# === 3. Load model dari folder ===
print("🔄 Memuat model dari folder lokal...")
clf_model = load(MODEL_PATH)
print("✅ Model berhasil dimuat!")

# === 4. Input data dari user ===
kompetensi = input("Masukkan kompetensi (misal: integritas): ").strip().lower()
nilai = float(input("Masukkan nilai (contoh: 3): "))
gap = float(input("Masukkan gap (contoh: -1): "))
aspek = input("Masukkan aspek (pengetahuan / keahlian / sikap kerja): ").strip().lower()

# === 5. Siapkan dataframe untuk prediksi ===
pegawai_baru = pd.DataFrame([{
    "kompetensi": kompetensi,
    "standar level": 3,   # default sementara
    "nilai": nilai,
    "gap": gap,
    "aspek": aspek,
    "feedback_terakhir": "tidak ada"
}])

# === 6. Prediksi probabilitas untuk semua kelas (saran pengembangan) ===
proba_clf = clf_model.predict_proba(pegawai_baru)[0]

# Ambil daftar kelas dari model (urutan sama dengan probabilitas)
clf_classes = clf_model.named_steps["model"].classes_

# === 7. Gabungkan skor ke dictionary ===
scores = {clf_classes[i]: proba_clf[i] for i in range(len(clf_classes))}

# === 8. Ambil 3 rekomendasi teratas ===
top_rekom = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]

# === 9. Tampilkan hasil ===
print("\n🎯 Top-3 Rekomendasi Saran Pengembangan:")
for rank, (saran, score) in enumerate(top_rekom, start=1):
    print(f"{rank}. {saran} (score: {score:.3f})")

print("\n✅ Uji coba selesai.")