import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/latsar_db")

# debug print
print("DATABASE_URL = ", os.getenv("DATABASE_URL"))

# membuat engine SQLAlchemy, yaitu mesin yang bertugas membuka koneksi ke database PostgreSQL
# ini seperti membuat saluran tetap terbuka antara aplikasi dan database
engine = create_engine(DATABASE_URL)

# Membuat Session factory, yaitu cara standar untuk membuat session database (koneksi aktif yang bisa melakukan query)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# autocommit=False artinya perubahan data tidak langsung disimpan ke database, harus di-commit dulu
# autoflush=False artinya perubahan data tidak otomatis dikirim ke database sebelum query, harus flush() dulu
# bind = engine menghubungkan session ini ke engine yang sudah dibuat sebelumnya
Base = declarative_base() # membuat base class untuk semua model ORM (di models.py)