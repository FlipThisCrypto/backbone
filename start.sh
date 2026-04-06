#!/bin/bash

# Backbone Development Environment Startup Script
echo "🚀 Starting Backbone NFT Reward System Development Environment"

# Check if virtual environment exists
if [ ! -d "backbone_env" ]; then
    echo "❌ Python virtual environment not found. Please run: python3 -m venv backbone_env"
    exit 1
fi

# Function to check if port is available
check_port() {
    if ! command -v lsof >/dev/null 2>&1; then
        return 0
    fi
    lsof -ti:$1 >/dev/null 2>&1
}

# Start Core API (Python)
echo "📡 Starting Core API Server (Python/FastAPI)..."
source backbone_env/bin/activate
cd core
if check_port 8000; then
    echo "⚠️  Port 8000 already in use. Core API may already be running."
else
    uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload &
    CORE_PID=$!
    echo "✅ Core API started on http://localhost:8000 (PID: $CORE_PID)"
fi
cd ..

# Start Node.js API
echo "🔌 Starting Node.js API Server..."
cd api
if check_port 3001; then
    echo "⚠️  Port 3001 already in use. API may already be running."
else
    npm run dev &
    API_PID=$!
    echo "✅ API Server started on http://localhost:3001 (PID: $API_PID)"
fi
cd ..

# Start UI Development Server
echo "🎨 Starting UI Development Server (Next.js)..."
cd ui
if check_port 3000; then
    echo "⚠️  Port 3000 already in use. UI may already be running."
else
    npm run dev &
    UI_PID=$!
    echo "✅ UI Development Server started on http://localhost:3000 (PID: $UI_PID)"
fi
cd ..

echo ""
echo "🎯 Backbone Development Environment Ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 UI Builder:           http://localhost:3000"
echo "🔌 API Endpoints:        http://localhost:3001"
echo "📡 Core API:             http://localhost:8000"
echo "📚 API Documentation:    http://localhost:3001/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🛠️  Commands:"
echo "   View logs: tail -f *.log"
echo "   Stop all:  pkill -f 'node\|uvicorn\|next'"
echo "   Health:    curl http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping all services..."; kill $CORE_PID $API_PID $UI_PID 2>/dev/null; exit' INT
wait