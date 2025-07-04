#!/bin/bash
# 🎸 INDUSTRIAL MIDI CREATOR - MODULAR EDITION 🎸

PORT=8083

echo "⚡ INDUSTRIAL MIDI CREATOR ⚡"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any weaklings on our port
EXISTING_PID=$(lsof -ti :$PORT 2>/dev/null)
if [ ! -z "$EXISTING_PID" ]; then
    echo "💀 TERMINATING process $EXISTING_PID on port $PORT..."
    kill -9 $EXISTING_PID
    sleep 0.5
    echo "✓ ELIMINATED!"
fi

# LAUNCH THE BEAST
echo "🚀 INITIALIZING INDUSTRIAL SERVER..."
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Let it breathe
sleep 0.5

# Verify our dominance
if ! lsof -ti :$PORT > /dev/null 2>&1; then
    echo "❌ FAILED TO CONQUER PORT $PORT!"
    echo "The machines have won this round..."
    exit 1
fi

echo "🔥 SERVER ONLINE [PID: $SERVER_PID]"

# UNLEASH THE BROWSER
URL="http://localhost:$PORT/index_modular.html"
echo "🌐 LAUNCHING INTO CYBERSPACE..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$URL" 2>/dev/null
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start "$URL"
else
    echo "⚠️  MANUAL OVERRIDE REQUIRED: $URL"
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  🎵 INDUSTRIAL BEATS ACTIVATED 🎵     ║"
echo "║  Port: $PORT | PID: $SERVER_PID              ║"
echo "║  [Ctrl+C] to DESTROY                  ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Wait for the end
trap ctrl_c INT

function ctrl_c() {
    echo ""
    echo "🛑 SHUTDOWN SEQUENCE INITIATED..."
    kill $SERVER_PID 2>/dev/null
    echo "💤 Server terminated. The silence is deafening."
    exit 0
}

# Keep the noise going
while true; do
    sleep 1
done