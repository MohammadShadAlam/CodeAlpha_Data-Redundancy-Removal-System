

import re
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(
    title="DataGuard API",
    description="Data Redundancy Removal System",
    version="1.1.0",
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
    email: str = ""
    phone: Optional[str] = None


class ScanRequest(BaseModel):
    records: list[Record]


@app.get("/")
def home():
    return {"message": "DataGuard Backend is running!"}


@app.post("/detect-duplicates")
def detect_duplicates(data: ScanRequest):
    seen_emails = {}
    seen_phones = {}
    duplicates = []

    for index, record in enumerate(data.records):
        email = record.email.strip().lower()
        phone = re.sub(r"\D", "", record.phone or "")

        email_master = seen_emails.get(email) if email else None
        phone_master = (
            seen_phones.get(phone)
            if len(phone) > 5
            else None
        )

        matched_by = []

        if email_master is not None:
            matched_by.append("email")

        if phone_master is not None:
            matched_by.append("phone")

        if matched_by:
            master_number = (
                email_master
                if email_master is not None
                else phone_master
            )

            duplicates.append({
                "master_record_number": master_number,
                "record_number": index + 1,
                "name": record.name,
                "email": record.email,
                "phone": record.phone,
                "matched_by": matched_by,
            })

        if email and email not in seen_emails:
            seen_emails[email] = index + 1

        if len(phone) > 5 and phone not in seen_phones:
            seen_phones[phone] = index + 1

    return {
        "total_records": len(data.records),
        "duplicates_found": len(duplicates),
        "duplicates": duplicates,
    }
