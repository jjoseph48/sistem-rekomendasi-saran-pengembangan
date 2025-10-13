from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Pegawai(Base):
    __tablename__ = "pegawai"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String)
    nip = Column(String, unique=True, index=True)
    satker = Column(String)
    jabatan = Column(String)
    kinerja = Column(String)  # 🔹 tambahan baru
    tanggal_registrasi = Column(DateTime, default=datetime.utcnow)

    kompetensi = relationship("KompetensiPegawai", back_populates="pegawai")
    saran = relationship("SaranPengembangan", back_populates="pegawai")

class KompetensiPegawai(Base):
    __tablename__ = "kompetensi_pegawai"
    id = Column(Integer, primary_key=True, index=True)
    pegawai_id = Column(Integer, ForeignKey("pegawai.id"))
    nama_kompetensi = Column(String)
    standar_level = Column(Float)
    capaian_nilai = Column(Float)
    gap_kompetensi = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    pegawai = relationship("Pegawai", back_populates="kompetensi")

class SaranPengembangan(Base):
    __tablename__ = "saran_pengembangan"
    id = Column(Integer, primary_key=True, index=True)
    pegawai_id = Column(Integer, ForeignKey("pegawai.id"))
    kompetensi = Column(String)
    aspek_kompetensi = Column(String)
    saran_pengembangan = Column(String)
    tanggal_saran = Column(DateTime, default=datetime.utcnow)

    pegawai = relationship("Pegawai", back_populates="saran")
    feedbacks = relationship("Feedback", back_populates="saran")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    saran_id = Column(Integer, ForeignKey("saran_pengembangan.id"))
    nip = Column(String, index=True)
    feedback = Column(String)
    tanggal_feedback = Column(DateTime, default=datetime.utcnow)

    saran = relationship("SaranPengembangan", back_populates="feedbacks")

class UserAdmin(Base):
    __tablename__ = "user_admin"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String)  # "admin" atau "superadmin"