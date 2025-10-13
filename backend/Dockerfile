# Gunakan Python 3.11
FROM python:3.11-slim

# Set direktori kerja
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode
COPY . .

# Jalankan aplikasi FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]