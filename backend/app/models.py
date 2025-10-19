from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# =======================
# Model UserAdmin
# =======================
class UserAdmin(Base):
    __tablename__ = "user_admin"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)


# =======================
# Model Pegawai
# =======================
class Pegawai(Base):
    __tablename__ = "pegawai"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String)
    nip = Column(String, unique=True, index=True)
    satker = Column(String)
    jabatan = Column(String)
    kinerja = Column(String)

    # Relasi ke tabel lain
    kompetensi = relationship("KompetensiPegawai", back_populates="pegawai", cascade="all, delete-orphan")
    saran_pengembangan = relationship("SaranPengembangan", back_populates="pegawai", cascade="all, delete-orphan")


# =======================
# Model KompetensiPegawai
# =======================
class KompetensiPegawai(Base):
    __tablename__ = "kompetensi_pegawai"

    id = Column(Integer, primary_key=True, index=True)
    pegawai_id = Column(Integer, ForeignKey("pegawai.id"))
    nama_kompetensi = Column(String(255), nullable=False)
    standar_level = Column(Float, nullable=False)
    capaian_nilai = Column(Float, nullable=False)
    gap_kompetensi = Column(Float, nullable=False)

    pegawai = relationship("Pegawai", back_populates="kompetensi")


# =======================
# Model SaranPengembangan
# =======================
class SaranPengembangan(Base):
    __tablename__ = "saran_pengembangan"

    id = Column(Integer, primary_key=True, index=True)
    pegawai_id = Column(Integer, ForeignKey("pegawai.id"))
    kompetensi = Column(String(255), nullable=False)
    aspek_kompetensi = Column(String(100), nullable=False)
    saran_pengembangan = Column(String, nullable=False)
    tanggal_rekomendasi = Column(DateTime, default=datetime.utcnow)
    is_selected = Column(Boolean, default=False)

    # 🔹 Tambahkan foreign key ke Feedback
    feedback_id = Column(Integer, ForeignKey("feedback.id"), nullable=True)

    # 🔹 Relationship
    pegawai = relationship("Pegawai", back_populates="saran_pengembangan")
    feedback = relationship("Feedback", back_populates="saran", uselist=False)


# =======================
# Model Feedback
# =======================
class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    feedback = Column(String)
    
    # 🔹 Relasi balik ke SaranPengembangan
    saran = relationship("SaranPengembangan", back_populates="feedback", uselist=False)