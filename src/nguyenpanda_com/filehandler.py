from pathlib import Path

class FileHandler:
    
    def __init__(self, default_files: str | Path):
        self.default_files = Path(default_files)
    
    def serve_file(self, file_path: Path) -> bytes:
        if not file_path.exists() or not file_path.is_file():
            file_path = self.default_files
        with open(file_path, 'rb') as f:
            body = f.read()
        return body
    