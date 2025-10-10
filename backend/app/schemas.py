from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PegawaiBase(BaseModel):
    nama: str
    nip: str
    satker: str
    jabatan: str
    level_kompetensi: float
    capaian_nilai: float
    gap_kompetensi: float
    kompetensi: str
    aspek_kompetensi: str

class PegawaiCreate(PegawaiBase):
    pass

class PegawaiResponse(PegawaiBase):
    id: int
    class Config:
        orm_mode = True


class PredictInput(BaseModel):
    level_kompetensi: float
    capaian_nilai: float
    gap_kompetensi: float
    kompetensi: str
    aspek_kompetensi: str


class SaranResponse(BaseModel):
    saran_pengembangan: str
    tanggal_rekomendasi: datetime
    class Config:
        orm_mode = True


class FeedbackCreate(BaseModel):
    saran_id: int
    feedback: str