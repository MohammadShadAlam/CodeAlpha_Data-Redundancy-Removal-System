# DataGuard — Data Redundancy Removal System

## Project Overview
DataGuard is a web-based application designed to detect duplicate records and help users manage redundant data efficiently. It provides a dashboard for viewing records, detecting duplicates, validating data, and reviewing duplicate entries.

## Features
- Dashboard and record management
- Add, edit, and delete records
- CSV import and export
- Duplicate detection using email and phone
- Duplicate review actions: Not a Duplicate, Delete Duplicate, and Merge Records
- Data validation
- Activity logs
- Persistent frontend data storage
- Python FastAPI backend for duplicate detection
- Responsive user interface

## Technology Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI
- Storage: Browser Local Storage
- API: REST API

## Prerequisites
- Node.js and npm
- Python 3.10+ recommended

## Run the Frontend
```bash
npm install
npm run dev
```

## Run the Backend
Open a separate terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the backend dependencies from the project's dependency file, if provided, then run:

```bash
python -m uvicorn main:app --reload
```

Backend API documentation: `http://127.0.0.1:8000/docs`

## Production Build
```bash
npm run build
```

## Note
This project was developed as an internship project to demonstrate record management and duplicate data detection.