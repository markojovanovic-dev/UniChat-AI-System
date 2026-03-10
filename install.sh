#!/bin/bash
set -e

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   UniChat AI — Kompletna instalacija              ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# ─── 1. Python ───────────────────────────────────────────
echo "═══ [1/7] Python ═══"
if command -v python3 &>/dev/null; then
    echo "  ✓ Python3 pronađen: $(python3 --version)"
else
    echo "  → Instaliram Python3..."
    sudo apt update -qq
    sudo apt install -y python3 python3-pip
    echo "  ✓ Python3 instaliran"
fi
echo ""

# ─── 2. Node.js ──────────────────────────────────────────
echo "═══ [2/7] Node.js ═══"

install_node() {
    echo "  → Instaliram Node.js..."
    # Download setup script to file first (piping to bash can break)
    if curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh 2>/dev/null; then
        sudo bash /tmp/nodesource_setup.sh
        sudo apt install -y nodejs
        rm -f /tmp/nodesource_setup.sh
    else
        echo "  ⚠ NodeSource nedostupan, instaliram iz apt repozitorijuma..."
        sudo apt update -qq
        sudo apt install -y nodejs npm
    fi
}

if command -v node &>/dev/null; then
    NODE_VER=$(node --version | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VER" -ge 18 ] 2>/dev/null; then
        echo "  ✓ Node.js pronađen: $(node --version)"
    else
        echo "  ⚠ Node.js verzija prestara (v$NODE_VER), treba 18+"
        install_node
        echo "  ✓ Node.js ažuriran: $(node --version)"
    fi
else
    install_node
    echo "  ✓ Node.js instaliran: $(node --version)"
fi

# npm sometimes doesn't come with nodejs package
if ! command -v npm &>/dev/null; then
    echo "  → npm nije pronađen, instaliram..."
    sudo apt install -y npm 2>/dev/null || true
fi

if ! command -v npm &>/dev/null; then
    echo ""
    echo "  ✗ GREŠKA: npm se nije instalirao."
    echo "    Ručno instalirajte Node.js sa: https://nodejs.org"
    echo "    ili pokrenite:"
    echo "      curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/ns.sh"
    echo "      sudo bash /tmp/ns.sh"
    echo "      sudo apt install -y nodejs"
    exit 1
fi
echo "  ✓ npm pronađen: $(npm --version)"
echo ""

# ─── 3. MySQL ────────────────────────────────────────────
echo "═══ [3/7] MySQL ═══"
if command -v mysql &>/dev/null; then
    echo "  ✓ MySQL pronađen"
else
    echo "  → Instaliram MySQL..."
    sudo apt update -qq
    sudo apt install -y mysql-server
    echo "  ✓ MySQL instaliran"
fi

if ! sudo systemctl is-active --quiet mysql 2>/dev/null; then
    echo "  → Pokrećem MySQL servis..."
    sudo systemctl start mysql
    sudo systemctl enable mysql 2>/dev/null || true
fi
echo "  ✓ MySQL servis aktivan"
echo ""

# ─── 4. MySQL baza ───────────────────────────────────────
echo "═══ [4/7] Baza podataka ═══"
echo "  → Kreiram bazu uni_db i popunjavam srpskim podacima..."
sudo mysql < "$PROJECT_DIR/backend/seed.sql"
echo "  → Kreiram read-only korisnika uni_reader..."
sudo mysql -e "
  CREATE USER IF NOT EXISTS 'uni_reader'@'localhost' IDENTIFIED BY 'readonly123';
  GRANT SELECT ON uni_db.* TO 'uni_reader'@'localhost';
  FLUSH PRIVILEGES;
" 2>/dev/null || echo "  (korisnik već postoji)"
STUDENT_COUNT=$(mysql -u uni_reader -preadonly123 -N -e "SELECT COUNT(*) FROM uni_db.studenti;" 2>/dev/null || echo "?")
echo "  ✓ Baza kreirana: $STUDENT_COUNT studenata, 4 profesora, 10 predmeta"
echo ""

# ─── 5. Ollama ───────────────────────────────────────────
echo "═══ [5/7] Ollama ═══"
if command -v ollama &>/dev/null; then
    echo "  ✓ Ollama pronađen"
else
    echo "  → Instaliram Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "  ✓ Ollama instaliran"
fi

if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
    echo "  → Pokrećem Ollama servis..."
    nohup ollama serve &>/dev/null &
    sleep 4
    if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
        echo "  ⚠ Ollama se nije pokrenuo automatski."
        echo "    Otvorite novi terminal i pokrenite: ollama serve"
    fi
fi
echo "  ✓ Ollama servis aktivan"
echo ""

# ─── 6. LLM Model ───────────────────────────────────────
echo "═══ [6/7] LLM Model (Qwen 2.5 Coder 14B) ═══"

if ollama list 2>/dev/null | grep -q "uni-chat-qwen"; then
    echo "  ✓ Model uni-chat-qwen već postoji u Ollama"
else
    echo "  → Preuzimam qwen2.5-coder:14b (~9 GB)..."
    ollama pull qwen2.5-coder:14b
    echo "  → Kreiram uni-chat-qwen model..."
    cd "$PROJECT_DIR"
    ollama create uni-chat-qwen -f Modelfile
    echo "  ✓ Model registrovan kao uni-chat-qwen"
fi
echo ""

# ─── 7. Zavisnosti projekta ─────────────────────────────
echo "═══ [7/7] Zavisnosti projekta ═══"

echo "  → Python paketi..."
cd "$PROJECT_DIR/backend"
pip install -r requirements.txt --break-system-packages -q 2>/dev/null \
  || pip install -r requirements.txt -q 2>/dev/null \
  || pip3 install -r requirements.txt --break-system-packages -q 2>/dev/null \
  || pip3 install -r requirements.txt -q
echo "  ✓ Python paketi instalirani"

echo "  → Node.js paketi..."
cd "$PROJECT_DIR/frontend"
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install 2>&1 | tail -5
if [ ${PIPESTATUS[0]:-$?} -ne 0 ]; then
    echo "  ⚠ Pokušavam ponovo sa čistim kešom..."
    npm cache clean --force 2>/dev/null || true
    npm install
fi
echo "  ✓ Node.js paketi instalirani"

cd "$PROJECT_DIR"
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║         ✓ Instalacija uspešno završena!           ║"
echo "╠═══════════════════════════════════════════════════╣"
echo "║                                                   ║"
echo "║   Pokrenite aplikaciju sa:  ./start.sh            ║"
echo "║   Otvorite:  http://localhost:5173                ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
