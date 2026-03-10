# UniChat AI — University Database Chat Assistant

[Srpska verzija](README.srb.md)

## What This Is

A full-stack web application where a locally-running AI model (Qwen 2.5 Coder 14B) reads a MySQL university database and answers questions about it in Serbian. You type a question in Serbian, the AI generates a SQL query, executes it against real data in the database, and shows you the results — complete with a live GPU dashboard, step-by-step inference visualization, role-based access control, and data export to Excel/PDF/Word.

The AI model runs entirely on your local machine using your NVIDIA GPU. No cloud APIs, no internet required after setup.


## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                             │
│                        http://localhost:5173                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP / WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND — React 18 + Vite 5                     │
│                          (Port 5173)                                │
│                                                                     │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │  Sidebar     │ │ GPU Dashboard│ │   Chat UI  │ │  Pipeline    │  │
│  │  (roles,     │ │ (nvidia-smi  │ │ (messages, │ │  visualizer  │  │
│  │  identity,   │ │  stats)      │ │  tables,   │ │  (processing │  │
│  │  suggestions)│ │              │ │  export)   │ │  steps)      │  │
│  └─────────────┘ └──────────────┘ └────────────┘ └──────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Vite Proxy (/api → :8000)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND — Python FastAPI + Uvicorn                 │
│                          (Port 8000)                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     /api/chat Endpoint                       │   │
│  │                                                              │   │
│  │  1. Receive question + role/identity                         │   │
│  │  2. Try template matching (regex patterns)                   │   │
│  │  3. If no template → call LLM to generate SQL                │   │
│  │  4. SQL validation (syntax + schema + permissions)           │   │
│  │  5. Execute query against MySQL                              │   │
│  │  6. Serialize results + export options                       │   │
│  └──────────┬───────────────────────────────────┬───────────────┘   │
│             │                                   │                   │
│             ▼                                   ▼                   │
│  ┌─────────────────────┐             ┌─────────────────────────┐   │
│  │   Ollama LLM API    │             │   MySQL (SQLAlchemy)    │   │
│  │  POST /api/chat     │             │   Read-only queries     │   │
│  └──────────┬──────────┘             └────────────┬────────────┘   │
└─────────────┼─────────────────────────────────────┼────────────────┘
              │                                     │
              ▼                                     ▼
┌──────────────────────────┐         ┌──────────────────────────────┐
│    OLLAMA SERVER          │         │          MySQL 8              │
│    (Port 11434)           │         │         (Port 3306)           │
│                           │         │                               │
│  Qwen 2.5 Coder 14B      │         │  uni_db database:             │
│  (~9 GB, local GPU)       │         │  ├── studenti  (20 records)   │
│                           │         │  ├── profesori (4 records)    │
│  ┌─────────────────────┐  │         │  ├── predmeti  (10 records)   │
│  │   NVIDIA GPU         │  │         │  ├── ocene     (~50 records)  │
│  │   8 GB+ VRAM         │  │         │  └── upisi     (~60 records)  │
│  └─────────────────────┘  │         │                               │
└──────────────────────────┘         └──────────────────────────────┘
```

### Query Processing Flow

```
User types: "Prikaži sve studente"
        │
        ▼
┌─ Frontend sends POST /api/chat ─────────────────────────────┐
│  { message: "Prikaži sve studente", role: "admin" }         │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  1. Template matching (regex)                │
        │     → "Prikaži sve studente" ✓ matched       │
        │     → SQL generated instantly (no LLM)       │
        └──────────────────────┬──────────────────────┘
                               │ (or if no template ↓)
        ┌──────────────────────┴──────────────────────┐
        │  2. Ollama LLM generates SQL                 │
        │     System prompt: DB schema + role context   │
        │     → Qwen 2.5 Coder generates SELECT query  │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  3. Triple validation                        │
        │     ✓ Syntax check (SELECT only)             │
        │     ✓ Schema check (tables + columns exist)  │
        │     ✓ Permission check (role has access)     │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  4. MySQL executes the query                 │
        │     SELECT id, ime, prezime, ... FROM studenti│
        │     → 20 records returned                    │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  5. Frontend renders table + export buttons  │
        │     Excel | PDF | Word                       │
        └─────────────────────────────────────────────┘
```


## System Requirements

> **Tested on Ubuntu 24.04 LTS with NVIDIA RTX GPUs.**
> The install script automatically installs everything except the NVIDIA driver.

### Minimum Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Operating System** | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| **NVIDIA GPU** | 8 GB VRAM | 12 GB+ VRAM |
| **NVIDIA Driver** | 525+ | Latest |
| **RAM** | 16 GB | 32 GB |
| **Disk Space** | 14 GB free | 20 GB+ free |
| **CPU** | Any x86_64 | 4+ cores |
| **Python** | 3.10+ | 3.12+ |
| **Node.js** | 18+ | 22 LTS |

### Disk Space Breakdown

| Component | Size |
|-----------|------|
| Qwen 2.5 Coder 14B model | ~9 GB |
| Python dependencies | ~200 MB |
| Node.js dependencies | ~150 MB |
| MySQL database (uni_db) | ~1 MB |
| Ollama runtime | ~500 MB |
| **Total** | **~10 GB** |

### Tested GPU Configurations

| GPU | VRAM | Status |
|-----|------|--------|
| RTX 4090 | 24 GB | Excellent — fast responses (~2-5s) |
| RTX 3080 | 10 GB | Good — solid performance (~5-10s) |
| RTX 3060 | 12 GB | Good — solid performance (~5-10s) |
| RTX 2080 | 8 GB | Works — slower responses (~10-20s) |
| GTX 1080 Ti | 11 GB | Works — slower responses (~15-25s) |

> **Note:** The model uses ~8.5 GB VRAM. GPUs with exactly 8 GB can run it but will be at the limit and may use RAM spillover (slower).


## Project Structure

```
uni-chat/
├── install.sh               # One command: installs ALL dependencies
├── start.sh                 # Launches all services with pre-flight checks
├── Modelfile                # Ollama config for the base model
│
├── backend/
│   ├── main.py              # FastAPI server (LLM, SQL validation, GPU, roles, export)
│   ├── requirements.txt     # Python packages
│   └── seed.sql             # Creates DB with Serbian university data
│
├── frontend/
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite dev server + proxy
│   ├── index.html           # HTML entry point
│   └── src/
│       ├── main.jsx         # React mount point
│       └── App.jsx          # Complete UI application
│
└── models/                  # (optional) Folder for local model files
```


## Complete Setup Guide

### Step 1: NVIDIA Driver

If you already have `nvidia-smi` working, skip this step.

```bash
# Ubuntu 24.04 LTS comes with the latest NVIDIA drivers
# If you don't have them:
sudo apt update -y
sudo apt upgrade -y
sudo reboot
```

After reboot, verify:

```bash
nvidia-smi
```

You should see output like:

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 560.xx       Driver Version: 560.xx       CUDA Version: 12.x    |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:01:00.0  On |                  N/A |
| 30%   35C    P0    30W / 200W |    500MiB /  8192MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```


### Step 2: Run the Install Script

```bash
git clone <repo-url> uni-chat
cd uni-chat
chmod +x install.sh start.sh
./install.sh
```

This single command does everything:

1. Checks and installs **Python 3** if missing
2. Checks and installs **Node.js 22** if missing or too old
3. Checks and installs **MySQL 8** if missing, starts the service
4. Creates the **uni_db** database and populates it with Serbian university data
5. Creates the **read-only** MySQL user (`uni_reader`)
6. Checks and installs **Ollama** if missing, starts the service
7. Downloads **Qwen 2.5 Coder 14B** model (~9 GB) and registers it as `uni-chat-qwen`
8. Installs Python backend dependencies (`pip install`)
9. Installs Node.js frontend dependencies (`npm install`)

> **Note:** Downloading the model (~9 GB) may take 5-30 minutes depending on your internet speed.


### Step 3: Start the Application

```bash
./start.sh
```

This script:

1. Checks that **MySQL** is running (starts it if not)
2. Checks that **Ollama** is running (starts it if not)
3. Checks that the **model** is available in Ollama
4. Checks that the **database** is seeded
5. Starts the **backend** on port 8000
6. Starts the **frontend** on port 5173

Open your browser to: **http://localhost:5173**


### Stopping the Application

Press `Ctrl+C` in the terminal running `start.sh`. This automatically stops:
- Frontend (Vite)
- Backend (Uvicorn)
- Ollama (if the script started it)
- MySQL (if the script started it)
- Frees GPU VRAM (unloads the model)


## Using the Application

### Choosing a Role

The sidebar has three roles with different access levels:

| Role | Table Access | What You Can Ask About |
|------|-------------|----------------------|
| **Student** | studenti, ocene, predmeti, upisi | Your grades, enrollments, GPA, subjects |
| **Profesor** | profesori, predmeti, ocene, studenti, upisi | Subjects you teach, student grades, statistics |
| **Admin** | ALL tables | Full access to all data (read-only) |

### Choosing an Identity

When using Student or Profesor, a dropdown menu appears:
- **Student** — pick a student from the list (e.g., "Marko Petrovic")
- **Profesor** — pick a professor from the list (e.g., "dr Jelena Markovic")
- **Admin** — no identity selection, full access

The AI automatically filters all SQL queries to show only the selected user's data.

### Asking Questions

Type questions in Serbian. The system supports two modes:

**Mode 1 — Data queries** (AI generates SQL):

| Question | What it does |
|----------|-------------|
| "Prikaži sve studente" | Lists all students with all columns |
| "Koje su moje ocene?" | Grades for the logged-in student |
| "Moj prosek" | GPA for the logged-in student |
| "Prosečna ocena po predmetu" | Aggregated stats per subject |
| "Ko predaje Baze podataka?" | Finds the professor for a subject |
| "Top 5 studenata po proseku" | Student rankings by GPA |
| "Koliko studenata ima na svakom smeru?" | Student count per program |
| "Koji studenti su na mom predmetu?" | (professor) Student list |
| "Ko ima najmanju prosečnu ocenu na mojim predmetima?" | (professor) Stats |

**Mode 2 — Conversation** (AI responds with text):

| Question | What it does |
|----------|-------------|
| "Zdravo" | Greeting and suggested queries |
| "Šta mogu da te pitam?" | Capability description with examples |
| "Kako funkcioniše ocenjivanje?" | Explanation using DB context |

### Exporting Results

After each successful query, three download buttons appear:

| Format | Extension | Library |
|--------|----------|---------|
| **Excel** | .xlsx | openpyxl |
| **PDF** | .pdf | reportlab |
| **Word** | .docx | python-docx |

### GPU Dashboard

The top panel shows real-time GPU statistics:
- **Utilization** — GPU usage percentage
- **VRAM** — used / total memory in GB
- **Temperature** — in °C with color indicators
- **Power Draw** — in W with limit display

Updates every 3 seconds via REST API and WebSocket. If `nvidia-smi` is not available, simulated values are shown (Demo mode).

### Inference Pipeline

Shows processing steps in real time:
```
Receive → SQL Generation → Validation → Execution → Response → Done
   ✓           ✓               ✓            ●          ○        ○
```
Each step changes color: gray (pending), blue (active), green (completed), red (error).


## Configuration

Set environment variables before running `start.sh` if needed:

| Variable | Default | When to Change |
|----------|---------|----------------|
| `OLLAMA_MODEL` | `uni-chat-qwen` | If you imported the model under a different name |
| `OLLAMA_URL` | `http://localhost:11434` | If Ollama runs on another machine |
| `MYSQL_URL` | `mysql+pymysql://uni_reader:readonly123@localhost:3306/uni_db` | If you changed MySQL credentials |

Example:

```bash
export OLLAMA_MODEL="qwen2.5-coder:14b"
./start.sh
```


## Security Model

Five independent layers prevent any database modification:

```
Layer 1: MySQL user              uni_reader has SELECT privileges ONLY
            │
Layer 2: SQLAlchemy              SET SESSION TRANSACTION READ ONLY
            │
Layer 3: SQL regex validation    Blocks INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/TRUNCATE
            │
Layer 4: LLM system prompt       Instructions: generate SELECT queries ONLY
            │
Layer 5: Schema filtering        Each role sees only its permitted tables
```

Even if the LLM somehow generates a destructive query, layers 1-3 block it before execution. Schema validation additionally checks that every table and column in the SQL actually exists in the database.


## Database Contents

The `seed.sql` script creates the `uni_db` database with Serbian university data:

| Table | Records | Columns | Contents |
|-------|---------|---------|----------|
| **studenti** | 20 | id, ime, prezime, broj_indeksa, godina_upisa, smer, email | Serbian names, index numbers (2023/0001), 4 programs |
| **profesori** | 4 | id, ime, prezime, titula, email, kabinet | Academic titles (dr, prof. dr), office numbers |
| **predmeti** | 10 | id, naziv, sifra, ects, semestar, profesor_id | Subjects with ECTS credits per semester |
| **ocene** | ~50 | id, student_id, predmet_id, ocena, datum_polaganja, semestar | Grades 5-10, winter + summer 2023/2024 |
| **upisi** | ~60 | id, student_id, predmet_id, akademska_godina, status | Enrollments for 2023/2024 and 2024/2025 |

### ER Diagram

```
studenti (1) ──────< (N) ocene (N) >────── (1) predmeti
    │                                              │
    │                                              │
    └──────< (N) upisi (N) >───────────────────────┘
                                                   │
                                         profesori (1) ──────< (N) predmeti
```

Relationships:
- One student has many grades and enrollments
- One subject has many grades and enrollments
- One professor teaches many subjects
- Grades link students to subjects (with grade and date)
- Enrollments link students to subjects (with academic year and status)


## API Endpoints

| Method | Path | Description | Request Body |
|--------|------|-------------|-------------|
| `GET` | `/api/health` | Server status check | — |
| `GET` | `/api/gpu` | GPU statistics (nvidia-smi) | — |
| `GET` | `/api/metrics` | Query count, avg response time, success rate | — |
| `GET` | `/api/users` | List of students and professors | — |
| `GET` | `/api/export/formats` | Available export formats | — |
| `POST` | `/api/chat` | Send a question | `{ message, role, user_id }` |
| `POST` | `/api/export` | Download results | `{ columns, rows, format }` |
| `WS` | `/ws/gpu` | WebSocket for real-time GPU stats | — |

### Example POST /api/chat

```json
// Request
{
  "message": "Prikaži sve studente",
  "role": "admin",
  "user_id": null
}

// Response (success — data)
{
  "success": true,
  "sql": "SELECT id, ime, prezime, broj_indeksa, godina_upisa, smer, email FROM studenti ORDER BY prezime",
  "columns": ["id", "ime", "prezime", "broj_indeksa", "godina_upisa", "smer", "email"],
  "rows": [["1", "Ana", "Đorđević", "2023/0001", "2023", "Informatika", "ana@uni.rs"], ...],
  "row_count": 20,
  "response_time": 0.45,
  "steps": [...],
  "export_formats": [{"id": "xlsx", "label": "Excel", "color": "#22c55e"}, ...]
}

// Response (success — text)
{
  "success": true,
  "text_response": "Zdravo! Ja sam univerzitetski AI asistent...",
  "sql": null,
  "columns": null,
  "rows": null,
  "row_count": 0
}
```


## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Ollama server nije dostupan" | Ollama service not running | `ollama serve` |
| "MySQL baza nije dostupna" | MySQL service not running | `sudo systemctl start mysql` |
| `npm: command not found` | Node.js not installed | `./install.sh` (or manually: NodeSource setup) |
| `ollama: command not found` | Ollama not installed | `curl -fsSL https://ollama.com/install.sh \| sh` |
| Wrong model name | Model registered under different name | `ollama list` then `export OLLAMA_MODEL="name"` |
| "Greška pri komunikaciji sa serverom" | Backend not running | `cd backend && python3 main.py` |
| GPU shows "Demo režim" | nvidia-smi unavailable | Install NVIDIA drivers |
| Model is slow | GPU not being used for inference | Check `nvidia-smi` — ollama must be in process list |
| "Prazan SQL upit" | LLM returned empty response | Try again or rephrase the question |
| Table not displaying | LLM generated invalid SQL | Click "Prikaži SQL" to see the error details |
| Install script fails | No internet connection | Check connectivity (needed for packages and model) |
| VRAM error loading model | Insufficient GPU memory | Minimum 8 GB VRAM required |


## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React, Vite | 18, 5 |
| Styling | CSS-in-JS, JetBrains Mono + Outfit fonts | — |
| Backend | Python FastAPI, Uvicorn | 3.12, 0.100+ |
| Database | MySQL, SQLAlchemy | 8, 2.0 |
| AI Model | Qwen 2.5 Coder | 14B parameters |
| Model Server | Ollama | latest |
| Export XLSX | openpyxl | 3.1+ |
| Export PDF | reportlab | 4.0+ |
| Export DOCX | python-docx | 1.1+ |
| GPU Monitoring | nvidia-smi | — |
| HTTP Client | httpx | 0.27+ |


---

**Copyright (c) 2025 Marko Jovanovic. All rights reserved.**
