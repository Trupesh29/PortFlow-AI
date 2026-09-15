"""Root conftest.py — ensures src/ is on sys.path so all sub-packages
(backend, database, ml, data) are importable when running pytest from src/.
"""
import sys
from pathlib import Path

# Add the src/ directory to Python path so pytest can discover all packages
_src_dir = str(Path(__file__).resolve().parent)
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)
