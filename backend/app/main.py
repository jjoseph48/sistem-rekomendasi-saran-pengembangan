from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # nanti bisa diganti ke domain Azure Blob
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)