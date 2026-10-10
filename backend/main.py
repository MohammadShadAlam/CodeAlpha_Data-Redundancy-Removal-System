from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI(
    title="DataGuard API",
    description="Data Redundancy Removal System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Record(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None


class ScanRequest(BaseModel):
    records: list[Record]


@app.get("/")
def home():
    return {
        "message": "DataGuard Backend is running!"
    }


@app.post("/detect-duplicates")
def detect_duplicates(data: ScanRequest):
    seen = set()
    duplicates = []

    for index, record in enumerate(data.records):
        email = record.email.strip().lower()
        phone = (
            record.phone.strip()
            if record.phone else ""
        )

        key = email if email else phone

        if key and key in seen:
            duplicates.append({
                "record_number": index + 1,
                "name": record.name,
                "email": record.email,
                "phone": record.phone
            })
        elif key:
            seen.add(key)

    return {
        "total_records": len(data.records),
        "duplicates_found": len(duplicates),
        "duplicates": duplicates
    }
