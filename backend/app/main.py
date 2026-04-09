from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import quotations  # tu router de cotizaciones

app = FastAPI(title="Quotation App")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router de cotizaciones
app.include_router(quotations.router)
