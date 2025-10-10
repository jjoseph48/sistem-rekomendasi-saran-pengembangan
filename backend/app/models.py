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
    level_kompetensi = Column(Float)
    capaian_nilai = Column(Float)
    gap_kompetensi = Column(Float)
    kompetensi = Column(String)
    aspek_kompetensi = Column(String)

    saran = relationship("SaranPengembangan", back_populates="pegawai")


class SaranPengembangan(Base):
    __tablename__ = "saran_pengembangan"
    id = Column(Integer, primary_key=True, index=True)
    pegawai_id = Column(Integer, ForeignKey("pegawai.id"))
    saran_pengembangan = Column(String)
    tanggal_rekomendasi = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="menunggu feedback")

    pegawai = relationship("Pegawai", back_populates="saran")
    feedback = relationship("Feedback", back_populates="saran")


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    saran_id = Column(Integer, ForeignKey("saran_pengembangan.id"))
    feedback = Column(String)
    tanggal_feedback = Column(DateTime, default=datetime.utcnow)

    saran = relationship("SaranPengembangan", back_populates="feedback")