@echo off
echo Starting local PDF viewer development server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python server...
    python local-server.py
) else (
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Using Node.js server...
        node local-server.js
    ) else (
        echo Error: Neither Python nor Node.js found!
        echo Please install Python 3 or Node.js to run the local server.
        echo.
        echo Python: https://www.python.org/downloads/
        echo Node.js: https://nodejs.org/
        pause
    )
)
