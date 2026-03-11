# UniChat AI — Univerzitetski AI Chat Asistent

[English version](README.md)

## Šta je ovo

Full-stack veb aplikacija gde lokalni AI model (Qwen 2.5 Coder 14B) čita MySQL univerzitetsku bazu podataka i odgovara na pitanja o njoj na srpskom jeziku. Kucate pitanje na srpskom, AI generiše SQL upit, izvršava ga nad pravim podacima u bazi i prikazuje rezultate — sa GPU dashboard-om u realnom vremenu, vizualizacijom koraka inferencije, kontrolom pristupa po ulogama i izvozom u Excel/PDF/Word.

AI model radi isključivo na vašoj lokalnoj mašini koristeći NVIDIA GPU. Nema cloud API-ja, nije potreban internet posle instalacije.


## Arhitektura sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KORISNIK (Pregledač)                        │
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
│  │  (uloge,     │ │ (nvidia-smi  │ │ (poruke,   │ │  vizualizac. │  │
│  │  identitet,  │ │  statistike) │ │  tabele,   │ │  (koraci     │  │
│  │  predlozi)   │ │              │ │  izvoz)    │ │  obrade)     │  │
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
│  │  1. Prijem upita + uloga/identitet                           │   │
│  │  2. Pokušaj prepoznavanja šablona (regex)                    │   │
│  │  3. Ako nema šablona → pozovi LLM za generisanje SQL-a      │   │
│  │  4. SQL validacija (syntax + schema + dozvole)               │   │
│  │  5. Izvršavanje upita nad MySQL bazom                        │   │
│  │  6. Serijalizacija rezultata + opcije za izvoz               │   │
│  └──────────┬───────────────────────────────────┬───────────────┘   │
│             │                                   │                   │
│             ▼                                   ▼                   │
│  ┌─────────────────────┐             ┌─────────────────────────┐   │
│  │   Ollama LLM API    │             │   MySQL (SQLAlchemy)    │   │
│  │  POST /api/chat     │             │   SELECT samo čitanje   │   │
│  └──────────┬──────────┘             └────────────┬────────────┘   │
└─────────────┼─────────────────────────────────────┼────────────────┘
              │                                     │
              ▼                                     ▼
┌──────────────────────────┐         ┌──────────────────────────────┐
│    OLLAMA SERVER          │         │          MySQL 8              │
│    (Port 11434)           │         │         (Port 3306)           │
│                           │         │                               │
│  Qwen 2.5 Coder 14B      │         │  uni_db baza:                 │
│  (~9 GB, lokalni GPU)     │         │  ├── studenti  (20 zapisa)    │
│                           │         │  ├── profesori (4 zapisa)     │
│  ┌─────────────────────┐  │         │  ├── predmeti  (10 zapisa)    │
│  │   NVIDIA GPU         │  │         │  ├── ocene     (~50 zapisa)   │
│  │   8 GB+ VRAM         │  │         │  └── upisi     (~60 zapisa)   │
│  └─────────────────────┘  │         │                               │
└──────────────────────────┘         └──────────────────────────────┘
```

### Tok obrade jednog pitanja

```
Korisnik kuca: "Prikaži sve studente"
        │
        ▼
┌─ Frontend šalje POST /api/chat ─────────────────────────────┐
│  { message: "Prikaži sve studente", role: "admin" }         │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  1. Provera šablona (regex match)            │
        │     → "Prikaži sve studente" ✓ prepoznat     │
        │     → SQL generisan odmah (bez LLM-a)        │
        └──────────────────────┬──────────────────────┘
                               │ (ili ako nema šablona ↓)
        ┌──────────────────────┴──────────────────────┐
        │  2. Ollama LLM generiše SQL                  │
        │     System prompt: šema baze + uloga         │
        │     → Qwen 2.5 Coder generiše SELECT upit   │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  3. Trostruka validacija                     │
        │     ✓ Syntax check (samo SELECT)             │
        │     ✓ Schema check (tabele + kolone postoje) │
        │     ✓ Dozvole (uloga ima pristup tabelama)   │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  4. MySQL izvršava upit                      │
        │     SELECT id, ime, prezime, ... FROM studenti│
        │     → 20 zapisa vraćeno                      │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │  5. Frontend prikazuje tabelu + izvoz dugmad │
        │     Excel | PDF | Word                       │
        └─────────────────────────────────────────────┘
```


## Sistemski zahtevi

> **Testirano na Ubuntu 24.04 LTS sa NVIDIA RTX GPU-om.**
> Install skripta automatski instalira sve osim NVIDIA drajvera.

### Minimalni zahtevi

| Zahtev | Minimum | Preporučeno |
|--------|---------|-------------|
| **Operativni sistem** | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| **NVIDIA GPU** | 8 GB VRAM | 12 GB+ VRAM |
| **NVIDIA drajver** | 525+ | Najnoviji |
| **RAM** | 16 GB | 32 GB |
| **Disk prostor** | 14 GB slobodno | 20 GB+ slobodno |
| **Procesor** | Bilo koji x86_64 | 4+ jezgara |
| **Python** | 3.10+ | 3.12+ |
| **Node.js** | 22+ | 24 LTS |

### Detalji o disk prostoru

| Komponenta | Veličina |
|------------|----------|
| Qwen 2.5 Coder 14B model | ~9 GB |
| Python zavisnosti | ~200 MB |
| Node.js zavisnosti | ~150 MB |
| MySQL baza (uni_db) | ~1 MB |
| Ollama runtime | ~500 MB |
| **Ukupno** | **~10 GB** |

### Testirane GPU konfiguracije

| GPU | VRAM | Status |
|-----|------|--------|
| RTX 4090 | 24 GB | Odlično — brz odgovor (~2-5s) |
| RTX 3080 | 10 GB | Dobro — solidne performanse (~5-10s) |
| RTX 3060 | 12 GB | Dobro — solidne performanse (~5-10s) |
| RTX 2080 | 8 GB | Radi — sporiji odgovor (~10-20s) |
| GTX 1080 Ti | 11 GB | Radi — sporiji odgovor (~15-25s) |

> **Napomena:** Model koristi ~8.5 GB VRAM-a. GPU sa tačno 8 GB može raditi, ali će biti na granici i koristiće RAM spillover (sporije).


## Struktura projekta

```
uni-chat/
├── install.sh               # Jedna komanda: instalira SVE zavisnosti
├── start.sh                 # Pokreće sve servise sa pre-flight proverama
├── Modelfile                # Ollama konfiguracija za bazni model
│
├── backend/
│   ├── main.py              # FastAPI server (LLM, SQL validacija, GPU, uloge, izvoz)
│   ├── requirements.txt     # Python paketi
│   └── seed.sql             # Kreiranje baze sa srpskim univerzitetskim podacima
│
├── frontend/
│   ├── package.json         # Node.js zavisnosti
│   ├── vite.config.js       # Vite dev server + proxy
│   ├── index.html           # HTML ulazna tačka
│   └── src/
│       ├── main.jsx         # React mount point
│       └── App.jsx          # Kompletna UI aplikacija
│
└── models/                  # (opciono) Folder za lokalne model fajlove
```


## Kompletno uputstvo za instalaciju

### Korak 1: NVIDIA drajver

Ako vam `nvidia-smi` već radi, preskočite ovaj korak.

```bash
# Ubuntu 24.04 LTS dolazi sa najnovijim NVIDIA drajverima
# Ako ih nemate:
sudo apt update
sudo apt upgrade
sudo reboot
```

Posle restarta, proverite:

```bash
nvidia-smi
```

Trebalo bi da vidite nešto poput:

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


### Korak 2: Pokrenite install skriptu

```bash
git clone <repo-url> uni-chat
cd uni-chat
chmod +x install.sh start.sh
./install.sh
```

Ova jedna komanda radi sve:

1. Proverava i instalira **Python 3** ako fali
2. Proverava i instalira **Node.js 24** ako fali ili je prestar
3. Proverava i instalira **MySQL 8** ako fali, pokreće servis
4. Kreira **uni_db** bazu i popunjava srpskim univerzitetskim podacima
5. Kreira **read-only** MySQL korisnika (`uni_reader`)
6. Proverava i instalira **Ollama** ako fali, pokreće servis
7. Preuzima **Qwen 2.5 Coder 14B** model (~9 GB) i registruje kao `uni-chat-qwen`
8. Instalira Python backend zavisnosti (`pip install`)
9. Instalira Node.js frontend zavisnosti (`npm install`)

> **Napomena:** Preuzimanje modela (~9 GB) može potrajati 5-30 minuta u zavisnosti od brzine interneta.


### Korak 3: Pokrenite aplikaciju

```bash
./start.sh
```

Ova skripta:

1. Proverava da **MySQL** radi (pokreće ga ako ne)
2. Proverava da **Ollama** radi (pokreće ga ako ne)
3. Proverava da **model** postoji u Ollama
4. Proverava da **baza** ima podatke
5. Pokreće **backend** na portu 8000
6. Pokreće **frontend** na portu 5173

Otvorite pregledač na: **http://localhost:5173**


### Zaustavljanje

Pritisnite `Ctrl+C` u terminalu gde je pokrenut `start.sh`. Ovo automatski zaustavlja:
- Frontend (Vite)
- Backend (Uvicorn)
- Ollama (ako ga je skripta pokrenula)
- MySQL (ako ga je skripta pokrenula)
- Oslobađa GPU VRAM (unload modela)


## Korišćenje aplikacije

### Izbor uloge

Bočna traka (sidebar) ima tri uloge sa različitim nivoima pristupa:

| Uloga | Pristup tabelama | Šta možete pitati |
|-------|-------------------|-------------------|
| **Student** | studenti, ocene, predmeti, upisi | Vaše ocene, upise, prosek, predmete |
| **Profesor** | profesori, predmeti, ocene, studenti, upisi | Predmete koje predajete, ocene studenata, statistike |
| **Admin** | SVE tabele | Potpun pristup svim podacima (samo čitanje) |

### Izbor identiteta

Kad koristite Student ili Profesor, pojavljuje se dropdown meni:
- **Student** — birate studenta iz liste (npr. "Marko Petrović")
- **Profesor** — birate profesora iz liste (npr. "dr Jelena Marković")
- **Admin** — nema izbor identiteta, potpun pristup

AI automatski filtrira sve SQL upite da prikazuju samo podatke izabranog korisnika.

### Postavljanje pitanja

Kucajte pitanja na srpskom jeziku. Sistem podržava dva režima:

**Režim 1 — Upiti o podacima** (AI generiše SQL):

| Pitanje | Šta radi |
|---------|----------|
| "Prikaži sve studente" | Lista svih studenata sa svim kolonama |
| "Koje su moje ocene?" | Ocene prijavljenog studenta |
| "Moj prosek" | Prosečna ocena prijavljenog studenta |
| "Prosečna ocena po predmetu" | Agregirana statistika po predmetima |
| "Ko predaje Baze podataka?" | Pronalazi profesora za predmet |
| "Top 5 studenata po proseku" | Rang lista studenata |
| "Koliko studenata ima na svakom smeru?" | Statistika po smerovima |
| "Koji studenti su na mom predmetu?" | (profesor) Spisak studenata |
| "Ko ima najmanju prosečnu ocenu na mojim predmetima?" | (profesor) Statistika |

**Režim 2 — Konverzacija** (AI odgovara tekstom):

| Pitanje | Šta radi |
|---------|----------|
| "Zdravo" | Pozdrav i predlozi pitanja |
| "Šta mogu da te pitam?" | Opis mogućnosti sa primerima |
| "Kako funkcioniše ocenjivanje?" | Objašnjenje sa kontekstom baze |

### Izvoz rezultata

Posle svakog uspešnog upita, pojavljuju se tri dugmeta za preuzimanje:

| Format | Ekstenzija | Biblioteka |
|--------|-----------|-----------|
| **Excel** | .xlsx | openpyxl |
| **PDF** | .pdf | reportlab |
| **Word** | .docx | python-docx |

### GPU Dashboard

Gornji panel prikazuje statistike GPU-a u realnom vremenu:
- **Iskorišćenost** — procenat korišćenja GPU-a
- **VRAM** — zauzeta / ukupna memorija u GB
- **Temperatura** — u °C sa indikacijom boja
- **Potrošnja** — u W sa prikazom limita

Ažurira se svake 3 sekunde putem REST API-ja i WebSocket-a. Ako `nvidia-smi` nije dostupan, prikazuje simulirane vrednosti (Demo režim).

### Pipeline vizualizacija

Prikazuje korake obrade u realnom vremenu:
```
Prijem → SQL Generisanje → Validacija → Izvršavanje → Odgovor → Gotovo
  ✓           ✓                ✓           ●           ○          ○
```
Svaki korak menja boju: siv (čeka), plav (aktivan), zelen (završen), crven (greška).


## Konfiguracija

Postavite environment varijable pre `start.sh` ako je potrebno:

| Varijabla | Podrazumevano | Kada menjati |
|-----------|--------------|-------------|
| `OLLAMA_MODEL` | `uni-chat-qwen` | Ako ste importovali model pod drugim imenom |
| `OLLAMA_URL` | `http://localhost:11434` | Ako Ollama radi na drugoj mašini |
| `MYSQL_URL` | `mysql+pymysql://uni_reader:readonly123@localhost:3306/uni_db` | Ako ste promenili MySQL kredencijale |

Primer:

```bash
export OLLAMA_MODEL="qwen2.5-coder:14b"
./start.sh
```


## Bezbednosni model

Pet nezavisnih slojeva sprečavaju bilo kakvu modifikaciju baze:

```
Sloj 1: MySQL korisnik          uni_reader ima SAMO SELECT privilegije
            │
Sloj 2: SQLAlchemy               SET SESSION TRANSACTION READ ONLY
            │
Sloj 3: SQL regex validacija     Blokira INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/TRUNCATE
            │
Sloj 4: LLM system prompt        Instrukcije: generiši SAMO SELECT upite
            │
Sloj 5: Filtriranje šeme         Svaka uloga vidi samo svoje tabele
```

Čak i da LLM nekako generiše destruktivan upit, slojevi 1-3 ga blokiraju pre izvršavanja. Schema validacija dodatno proverava da svaka tabela i kolona u SQL-u zaista postoji u bazi.


## Sadržaj baze

Skripta `seed.sql` kreira `uni_db` bazu sa srpskim univerzitetskim podacima:

| Tabela | Zapisa | Kolone | Sadržaj |
|--------|--------|--------|---------|
| **studenti** | 20 | id, ime, prezime, broj_indeksa, godina_upisa, smer, email | Srpska imena, indeksi (2023/0001), 4 smera |
| **profesori** | 4 | id, ime, prezime, titula, email, kabinet | Akademske titule (dr, prof. dr), kabineti |
| **predmeti** | 10 | id, naziv, sifra, ects, semestar, profesor_id | Predmeti sa ECTS kreditima po semestrima |
| **ocene** | ~50 | id, student_id, predmet_id, ocena, datum_polaganja, semestar | Ocene 5-10, zimski + letnji 2023/2024 |
| **upisi** | ~60 | id, student_id, predmet_id, akademska_godina, status | Upisi za 2023/2024 i 2024/2025 |

### ER dijagram

```
studenti (1) ──────< (N) ocene (N) >────── (1) predmeti
    │                                              │
    │                                              │
    └──────< (N) upisi (N) >───────────────────────┘
                                                   │
                                         profesori (1) ──────< (N) predmeti
```

Relacije:
- Jedan student ima više ocena i upisa
- Jedan predmet ima više ocena i upisa
- Jedan profesor predaje više predmeta
- Ocene povezuju studente i predmete (sa ocenom i datumom)
- Upisi povezuju studente i predmete (sa akademskom godinom i statusom)


## API endpointi

| Metod | Putanja | Opis | Telo zahteva |
|-------|---------|------|-------------|
| `GET` | `/api/health` | Status servera | — |
| `GET` | `/api/gpu` | GPU statistike (nvidia-smi) | — |
| `GET` | `/api/metrics` | Broj upita, prosečno vreme, uspešnost | — |
| `GET` | `/api/users` | Lista studenata i profesora | — |
| `GET` | `/api/export/formats` | Dostupni formati za izvoz | — |
| `POST` | `/api/chat` | Slanje pitanja | `{ message, role, user_id }` |
| `POST` | `/api/export` | Preuzimanje rezultata | `{ columns, rows, format }` |
| `WS` | `/ws/gpu` | WebSocket za GPU statistike | — |

### Primer POST /api/chat

```json
// Zahtev
{
  "message": "Prikaži sve studente",
  "role": "admin",
  "user_id": null
}

// Odgovor (uspeh)
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

// Odgovor (tekstualni)
{
  "success": true,
  "text_response": "Zdravo! Ja sam univerzitetski AI asistent...",
  "sql": null,
  "columns": null,
  "rows": null,
  "row_count": 0
}
```


## Rešavanje problema

| Problem | Uzrok | Rešenje |
|---------|-------|--------|
| "Ollama server nije dostupan" | Ollama servis nije pokrenut | `ollama serve` |
| "MySQL baza nije dostupna" | MySQL servis nije pokrenut | `sudo systemctl start mysql` |
| `npm: command not found` | Node.js nije instaliran | `./install.sh` (ili ručno: [NodeSource setup](https://deb.nodesource.com/setup_24.x)) |
| `ollama: command not found` | Ollama nije instaliran | `curl -fsSL https://ollama.com/install.sh \| sh` |
| Pogrešno ime modela | Model registrovan pod drugim imenom | `ollama list` pa `export OLLAMA_MODEL="ime"` |
| "Greška pri komunikaciji sa serverom" | Backend nije pokrenut | `cd backend && python3 main.py` |
| GPU prikazuje "Demo režim" | Nema nvidia-smi | Instalirajte NVIDIA drajvere |
| Model je spor | GPU ne koristi se za inferenciju | Proverite `nvidia-smi` — ollama mora biti u listi procesa |
| "Prazan SQL upit" | LLM vratio prazan odgovor | Pokušajte ponovo ili preformulirajte pitanje |
| Tabela se ne prikazuje | LLM generisao neispravan SQL | Pogledajte "Prikaži SQL" za detalje greške |
| Install skripta pada | Nema internet konekcije | Proverite konekciju (potrebna za preuzimanje paketa i modela) |
| VRAM error pri učitavanju modela | Nedovoljno GPU memorije | Potrebno minimum 8 GB VRAM |


## Tehnologije

| Sloj | Tehnologija | Verzija |
|------|------------|---------|
| Frontend | React, Vite | 18, 5 |
| Stilovi | CSS-in-JS, JetBrains Mono + Outfit fontovi | — |
| Backend | Python FastAPI, Uvicorn | 3.12, 0.100+ |
| Baza | MySQL, SQLAlchemy | 8, 2.0 |
| AI Model | Qwen 2.5 Coder | 14B parametara |
| Model Server | Ollama | najnoviji |
| Izvoz XLSX | openpyxl | 3.1+ |
| Izvoz PDF | reportlab | 4.0+ |
| Izvoz DOCX | python-docx | 1.1+ |
| GPU Monitoring | nvidia-smi | — |
| HTTP klijent | httpx | 0.27+ |


---

**Copyright (c) 2026 Marko Jovanovic. All rights reserved.**
