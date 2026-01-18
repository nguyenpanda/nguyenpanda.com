import psutil
import socket
from pathlib import Path
from typing import Optional


def _max_cores(_type: str):
    _type = _type.strip().lower()
    logical = True if _type.startswith('log') else False
    return psutil.cpu_count(logical)

def _add(a, b):
    if isinstance(b, str):
        try:
            b = int(b)
        except ValueError:
            pass
    return a + b

def _minus(a, b):
    if isinstance(b, str):
        try:
            b = int(b)
        except ValueError:
            pass
    return a - b

def _multiply(a, b):
    if isinstance(b, str):
        try:
            b = int(b)
        except ValueError:
            pass
    return a * b

def _get_ip_addresses():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ip = s.getsockname()[0]
    s.close()
    return ip

def _int(value: str):
    return int(value)

def cwd() -> str:
    return str(Path.cwd().absolute())

def parent(path: str) -> str:
    p = Path(path).resolve().absolute()
    return str(p.parent)

DEFAULT_FUNC = {
	'max_cores': (_max_cores, 1),
    'int': (_int, 1),
	'add': (_add, 2),
	'minus': (_minus, 2),
    'multiply': (_multiply, 2),
    'cwd': (cwd, 0),
    'parent': (parent, 1),
    'get_ip_addresses': (_get_ip_addresses, 0),
}
