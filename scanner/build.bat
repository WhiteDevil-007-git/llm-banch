@echo off
echo Building LLM Bench Scanner...
pyinstaller --onefile --console --name "LLMBench-Scanner" scanner.py
echo.
echo Build complete! Find the exe in dist/LLMBench-Scanner.exe
pause
