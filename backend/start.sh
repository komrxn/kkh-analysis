#!/bin/bash
# Quick Start Script for ANOVA/PCA Backend

echo "🚀 Starting ANOVA/PCA Analysis Backend..."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Start server
echo "✨ Starting FastAPI server on http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "---"
python app.py

