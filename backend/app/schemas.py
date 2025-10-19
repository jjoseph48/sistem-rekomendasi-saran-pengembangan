from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# =====================================================
# 👤 Data Pegawai
# =====================================================

class KompetensiInput(BaseModel):
    nama_kompetensi: str
    standar_level: float
    capaian_nilai: float
    gap_kompetensi: float


class PegawaiBase(BaseModel):
    nama: str
    nip: str
    satker: str
    jabatan: str
    kinerja: str  # 🔹 tambahan baru


class PegawaiCreate(PegawaiBase):
    kompetensi: List[KompetensiInput]  # 🔹 daftar kompetensi


class PegawaiResponse(PegawaiBase):
    id: int
    tanggal_registrasi: Optional[datetime]
    class Config:
        orm_mode = True


# =====================================================
# 🔍 Prediksi ML
# =====================================================

class PredictInput(BaseModel):
    nama_kompetensi: str
    level_kompetensi: float
    capaian_nilai: float
    gap_kompetensi: float
    kompetensi: str
    aspek_kompetensi: str
    feedback_terakhir: str


class SaranResponse(BaseModel):
    saran_pengembangan: str
    aspek_kompetensi: str
    tanggal_saran: datetime
    class Config:
        orm_mode = True


# =====================================================
# 🧠 Feedback
# =====================================================

class FeedbackCreate(BaseModel):
    saran_id: int
    feedback: str           # (sangat efektif, efektif, kurang efektif, tidak efektif)

class EditSaran(BaseModel):
    kompetensi: str
    aspek_kompetensi: str
    saran_pengembangan: str
    feedback_terakhir: Optional[str] = "Tidak Ada"
