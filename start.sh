#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Track what WE started so we only stop what we started
STARTED_MYSQL=false
STARTED_OLLAMA=false
BACKEND_PID=""
FRONTEND_PID=""
OLLAMA_PID=""

# ─── Cleanup function — runs on Ctrl+C or exit ──────────
cleanup() {
    echo ""
    echo ""
    echo "═══ Zaustavljam sve servise... ═══"

    # Kill frontend
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null
        echo "  ✓ Frontend zaustavljen"
    fi

    # Kill backend
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null
        echo "  ✓ Backend zaustavljen"
    fi

    # Kill any lingering uvicorn/vite processes we may have spawned
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    pkill -f "vite.*--port" 2>/dev/null || true

    # Unload model from memory (always — frees VRAM/RAM regardless of who started Ollama)
    if [ -n "$MODEL_NAME" ]; then
        ollama stop "$MODEL_NAME" 2>/dev/null || true
    fi

    # Stop Ollama (only if we started it)
    if [ "$STARTED_OLLAMA" = true ]; then
        echo "  → Zaustavljam Ollama..."
        if [ -n "$OLLAMA_PID" ]; then
            kill "$OLLAMA_PID" 2>/dev/null
            wait "$OLLAMA_PID" 2>/dev/null
        fi
        pkill -f "ollama serve" 2>/dev/null || true
        sudo systemctl stop ollama 2>/dev/null || true
        sleep 1
        echo "  ✓ Ollama zaustavljen"
    fi

    # Stop MySQL (only if we started it)
    if [ "$STARTED_MYSQL" = true ]; then
        echo "  → Zaustavljam MySQL..."
        if sudo systemctl stop mysql 2>/dev/null; then
            echo "  ✓ MySQL zaustavljen"
        else
            echo "  ✗ MySQL nije zaustavljen (pokušajte ručno: sudo systemctl stop mysql)"
        fi
    fi

    echo ""
    echo "  ✓ Sve čisto. Doviđenja!"
    echo ""
    exit 0
}

# Register cleanup for Ctrl+C, terminal close, and script exit
trap cleanup INT TERM EXIT

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   UniChat AI — Pokretanje                         ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# ─── Pre-flight: MySQL ───────────────────────────────────
READY=true

if sudo systemctl is-active --quiet mysql 2>/dev/null; then
    echo "  ✓ MySQL već aktivan (nije pokrenut od strane skripte)"
else
    echo "  → Pokrećem MySQL..."
    sudo systemctl start mysql
    if sudo systemctl is-active --quiet mysql 2>/dev/null; then
        STARTED_MYSQL=true
        echo "  ✓ MySQL pokrenut"
    else
        echo "  ✗ MySQL se ne može pokrenuti."
        READY=false
    fi
fi

# ─── Pre-flight: Ollama ─────────────────────────────────
if curl -s http://localhost:11434/api/tags &>/dev/null; then
    echo "  ✓ Ollama već aktivan (nije pokrenut od strane skripte)"
else
    echo "  → Pokrećem Ollama..."
    nohup ollama serve &>/dev/null &
    OLLAMA_PID=$!
    sleep 4
    if curl -s http://localhost:11434/api/tags &>/dev/null; then
        STARTED_OLLAMA=true
        echo "  ✓ Ollama pokrenut"
    else
        echo "  ✗ Ollama se ne može pokrenuti."
        READY=false
    fi
fi

# ─── Pre-flight: Model ──────────────────────────────────
MODEL_NAME="${OLLAMA_MODEL:-uni-chat-qwen}"
if ollama list 2>/dev/null | grep -q "$MODEL_NAME"; then
    echo "  ✓ Model $MODEL_NAME dostupan"
else
    echo "  ✗ Model $MODEL_NAME nije pronađen"
    echo "    Pokrenite ./install.sh prvo."
    READY=false
fi

# ─── Pre-flight: Baza ───────────────────────────────────
if mysql -u uni_reader -preadonly123 -e "SELECT 1 FROM uni_db.studenti LIMIT 1" &>/dev/null; then
    echo "  ✓ Baza uni_db dostupna"
else
    echo "  ✗ Baza uni_db nije dostupna"
    echo "    Pokrenite: sudo mysql < backend/seed.sql"
    READY=false
fi

if [ "$READY" = false ]; then
    echo ""
    echo "  ✗ Nisu svi servisi dostupni. Pokrenite ./install.sh prvo."
    exit 1
fi

echo ""
echo "  Model: $MODEL_NAME"
echo ""

# ─── Start backend ──────────────────────────────────────
echo "→ Pokrećem backend (port 8000)..."
cd "$PROJECT_DIR/backend"
python3 main.py &
BACKEND_PID=$!
cd "$PROJECT_DIR"

sleep 2

# Verify backend started
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "  ✗ Backend se nije pokrenuo. Proverite greške iznad."
    exit 1
fi

# ─── Start frontend ─────────────────────────────────────
echo "→ Pokrećem frontend (port 5173)..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
cd "$PROJECT_DIR"

sleep 3

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║  ✓ Backend:   http://localhost:8000               ║"
echo "║  ✓ Frontend:  http://localhost:5173               ║"
echo "║                                                   ║"
echo "║  Otvorite http://localhost:5173 u pregledaču      ║"
echo "║                                                   ║"
echo "║  Ctrl+C zaustavlja SVE servise                    ║"
echo "║  (backend, frontend, Ollama, MySQL)               ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
