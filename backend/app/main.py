from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models
from app.database import Base, engine, SessionLocal
from app.routers import auth, pegawai, predict, feedback, admin, superadmin
import os

# =====================================================
# ⚙️ Inisialisasi Aplikasi
# =====================================================
app = FastAPI(title="Latsar Sistem Rekomendasi")

# =====================================================
# 🔐 Buat Superadmin Otomatis (jika belum ada)
# =====================================================
def init_superadmin():
    db = SessionLocal()
    username = os.getenv("SUPERADMIN_DEFAULT_USER", "superadmin")
    password = os.getenv("SUPERADMIN_DEFAULT_PASS", "super123")

    existing = db.query(models.UserAdmin).filter(models.UserAdmin.username == username).first()
    if not existing:
        superadmin = models.UserAdmin(username=username, password=password, role="superadmin")
        db.add(superadmin)
        db.commit()
        print(f"✅ Superadmin '{username}' berhasil dibuat (password: {password})")
    db.close()

# =====================================================
# 🧱 Setup Database
# =====================================================
Base.metadata.create_all(bind=engine)
init_superadmin()

# =====================================================
# 🌐 CORS Middleware
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # nanti ganti ke domain frontend / Azure Blob
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# 📦 Registrasi Router
# =====================================================
app.include_router(auth.router)
app.include_router(pegawai.router)
app.include_router(predict.router)
app.include_router(feedback.router)
app.include_router(admin.router)
app.include_router(superadmin.router)

# =====================================================
# 🏠 Root Endpoint
# =====================================================
@app.get("/")
def root():
    return {"message": "✅ Latsar backend aktif dan siap digunakan"}