#!/bin/bash

echo "Starting local PDF viewer development server..."
echo

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "Using Python server..."
    python3 local-server.py
elif command -v python &> /dev/null; then
    echo "Using Python server..."
    python local-server.py
elif command -v node &> /dev/null; then
    echo "Using Node.js server..."
    node local-server.js
else
    echo "Error: Neither Python nor Node.js found!"
    echo "Please install Python 3 or Node.js to run the local server."
    echo
    echo "Python: https://www.python.org/downloads/"
    echo "Node.js: https://nodejs.org/"
    exit 1
fi
