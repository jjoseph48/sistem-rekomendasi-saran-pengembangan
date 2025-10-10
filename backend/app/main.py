from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from app.database import Base, engine
from app.routes import auth, predict, feedback
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Latsar Sistem Rekomendasi")

# Buat tabel otomatis
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # nanti bisa diganti ke domain Azure Blob
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(predict.router, prefix="/predict", tags=["Predict"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])

@app.get("/")
def root():
    return {"message": "Latsar backend aktif ✅"}