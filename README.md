# DocAtlas

DocAtlas is a multi-tenant document assistant platform with:
- an **Admin app** for authentication, document uploads, and widget instructions
- an embeddable **chat widget** build (`widget.js` + `widget.css`)
- a **FastAPI backend** for document ingestion and retrieval
- a **sample chatbot client** frontend

---

## Repository Structure

```text
backend/                  FastAPI + ChromaDB integration
frontend/DocAtlas/        Main admin frontend (React + Vite + Firebase)
frontend/chatbotClient/   Sample website/chat client frontend
README.md                 This file
```

---

## Tech Stack

### Frontend (Admin)
- React 19 + TypeScript + Vite
- Tailwind CSS
- Firebase Auth + Firestore + Storage
- React Router

### Backend
- FastAPI
- ChromaDB Cloud (dense + sparse indexing)
- Python document parsing pipeline (PDF, DOCX, CSV, XLSX, TXT)

---

## Prerequisites

- Node.js 20+
- npm
- Python 3.11+
- A Firebase project (Auth, Firestore, Storage enabled)
- A Chroma Cloud account

---

## Environment Variables

### 1) Admin frontend (`frontend/DocAtlas/.env`)

Create `frontend/DocAtlas/.env`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Notes:
- `VITE_FIREBASE_STORAGE_BUCKET` can be `your-bucket.appspot.com` or `gs://your-bucket.appspot.com`.
- The app normalizes this value before Firebase init.

### 2) Backend (`backend/.env`)

Create `backend/.env`:

```bash
CHROMA_API_KEY=...
CHROMA_TENANT=...
CHROMA_DATABASE=...
```

---

## Run Locally

### A) Admin frontend

```bash
cd frontend/DocAtlas
npm install
npm run dev
```

Default Vite URL is usually: `http://localhost:5173`

### B) Backend API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

API URL: `http://localhost:8000`

### C) Sample chatbot client (optional)

```bash
cd frontend/chatbotClient
npm install
npm run dev
```

---

## Admin App Features

- Authenticated dashboard with sidebar navigation
- Knowledge Base upload panel
- Paginated “Your Documents” list (**5 docs per page**)
- Document delete action
- Instructions page with dynamic tenant UID and embed snippet
- Error page with auth-aware back navigation

---

## Widget Build & Embed

From `frontend/DocAtlas`:

```bash
npm run build:widget
```

This produces:
- `dist-widget/widget.js`
- `dist-widget/widget.css`

Embed on client site:

```html
<link rel="stylesheet" href="https://<YOUR_CDN>/widget.css" />
<script
  src="https://<YOUR_CDN>/widget.js"
  data-tenant-uid="<TENANT_UID>"
  defer
></script>
```

`data-tenant-uid` is required. The widget reads it from the script tag at runtime.

---

## Backend API Endpoints

### `POST /upload-file`
Upload and process a document for Chroma ingestion.

- Form-data: `file`

### `POST /query`
Query indexed content.

Body:

```json
{
  "prompt": "Your question",
  "top_k": 5
}
```

Rate limit is enabled (`100/minute` per IP).

---

## CORS

Configured in `backend/server.py` for:
- `https://doc-atlas-taupe.vercel.app`
- `http://localhost:5173`
- `http://localhost:5174`

Update this list when adding new frontend domains.

---

## Build Commands

### Admin frontend

```bash
cd frontend/DocAtlas
npm run build
npm run preview
```

### Sample client

```bash
cd frontend/chatbotClient
npm run build
npm run preview
```

---

## Important Notes

- The current chatbot UI includes mock behavior in places; production wiring to backend endpoints may require additional integration depending on deployment path.
- Firestore pagination is server-side (`limit/startAfter`) for the documents list.
- If Firestore index errors appear for ordered queries, create the required composite index or keep the implemented fallback path.

---

## License

Internal project. Add a license section if you plan open-source distribution.
