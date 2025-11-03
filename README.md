# 🧩 Sistem Rekomendasi Saran Pengembangan Pegawai (FastAPI)

Proyek ini merupakan aplikasi berbasis **FastAPI** yang berfungsi untuk mengelola data pegawai, kompetensi, saran pengembangan, serta feedback.
Aplikasi ini juga terhubung dengan **PostgreSQL** sebagai database dan memiliki frontend berbasis HTML, CSS, dan JavaScript sederhana.

---

## 🚀 Fitur Utama

* **Registrasi Pegawai** beserta data kompetensinya.
* **Prediksi & Rekomendasi Saran Pengembangan** berbasis data kompetensi (ML-ready).
* **Manajemen Feedback** (Efektif, Kurang Efektif, dst).
* **Dashboard & Riwayat Saran** untuk pegawai.
* **Dashboard Admin dan Superadmin**.

---

## 🧱 Struktur Folder

```
root/
│
├── backend/
│       ├── app/
│       │   ├── main.py                # Entry point FastAPI
│       │   ├── database.py            # Koneksi dan konfigurasi SQLAlchemy
│       │   ├── models.py              # ORM Model (Pegawai, Kompetensi, Feedback, dll)
│       │   ├── schemas.py             # Pydantic model untuk request/response
│       │   ├── crud.py                # Fungsi CRUD helper (create, read, update, delete)
│       │   ├── routers/
│       │       ├── pegawai.py         # Endpoint pegawai
│       │       ├── auth.py            # Endpoint register dan login pegawai
│       │       ├── feedback.py        # Endpoint kategori dan input feedback
│       │       ├── predict.py         # Endpoint pemanggilan model ML
│       │       ├── kompetensi.py      # Endpoint kompetensi
│       │       ├── superadmin.py      # Endpoint superadmin
│       │       └── admin.py           # Endpoint admin
│       └── model/                 # Model machine learning untuk rekomendasi
│       │   └── model_classification_best_tuned_linux.joblib    # Model hasil tuning      
│       └── requirements.txt       # dependensi Python
├── frontend/
│   ├── js/
│   │   ├── registrasi.js
│   │   ├── riwayat-saran.js
│   │   └── dashboard.js
│   ├── css/
│   │   └── style.css
│   ├── dashboard-admin.html
│   ├── dashboard-pegawai.html
│   ├── dashboard-superadmin.html
│   ├── index.html
│   ├── login-admin.html
│   ├── login-pegawai.html
│   ├── login-superadmin.html
│   ├── profil-pegawai.html
│   ├── register-pegawai.html
│   └── riwayat-saran.html
│
├── .env                       # Konfigurasi variabel lingkungan (DATABASE_URL)
└── README.md                  # Dokumentasi proyek ini
```

---

## ⚙️ Instalasi & Konfigurasi

### 1️⃣ Clone Repository

```bash
git clone https://github.com/jjoseph48/sistem-rekomendasi-saran-pengembangan.git
cd sistem-rekomendasi-saran-pengembangan
```

### 2️⃣ Buat Virtual Environment

```bash
python -m venv venv
source venv/bin/activate     # Linux/macOS
venv\Scripts\activate        # Windows
```

### 3️⃣ Install Dependensi

```bash
pip install -r requirements.txt
```

### 4️⃣ Konfigurasi Database

Buat file `.env` di root proyek:

```bash
DATABASE_URL=postgresql://latsar_user:password@localhost:5432/latsar_db
```

Pastikan PostgreSQL aktif, lalu buat database:

```bash
psql -U postgres
CREATE DATABASE latsar_db;
```

### 5️⃣ Migrasi Database

Jalankan Python shell untuk membuat tabel:

```bash
python
>>> from app.database import Base, engine
>>> from app import models
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

---

## 🧩 Penjelasan File Utama

### 📕 `main.py`

Menginisialisasi aplikasi FastAPI dan memuat semua router:

```python
from fastapi import FastAPI
from app.routers import pegawai, saran, feedback

app = FastAPI(title="Sistem Rekomendasi Saran Pegawai")
app.include_router(pegawai.router)
app.include_router(saran.router)
app.include_router(feedback.router)
```

---

## 🌐 Menjalankan Server

```bash
uvicorn app.main:app --reload
```

Server default akan berjalan di:

```
http://127.0.0.1:8000
```

Coba akses dokumentasi interaktif:

```
http://127.0.0.1:8000/docs
```

---

## 🧹 Troubleshooting

| Masalah                                         | Solusi                                                    |
| ----------------------------------------------- | --------------------------------------------------------- |
| `OperationalError: could not connect to server` | Pastikan PostgreSQL berjalan & kredensial di `.env` benar |
| `404 (Not Found) pada /api/feedback/`           | Isi tabel `feedback` minimal 1 data                       |
| `Out of Memory` di VPS                          | Upgrade RAM atau hapus cache database lama                |
| Tidak bisa konek ke server FastAPI              | Cek port dan firewall VPS                                 |

---

## ✨ Catatan Akhir

Proyek ini dapat dikembangkan lebih lanjut dengan:

* Integrasi model machine learning untuk rekomendasi saran otomatis
* Sistem autentikasi JWT untuk admin dan pegawai
* Dashboard analitik berbasis Chart.js atau Recharts

---

📌 **Dibuat oleh:**
Tim Pengembang Sistem Rekomendasi LATSAR
(berbasis pada pelatihan pengembangan talenta ASN)
