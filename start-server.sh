#!/bin/bash
# Start a local web server for the Industrial Music Generator

echo "Starting local web server..."
echo "The app will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
# Check if Node.js is available
elif command -v npx &> /dev/null; then
    npx http-server -p 8000
else
    echo "Error: No suitable web server found."
    echo "Please install Python 3, Python 2, or Node.js"
    exit 1
fi