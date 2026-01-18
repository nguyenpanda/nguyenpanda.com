#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import shutil
import zipfile
import gdown
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Colors:
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class AssetLoader:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent
        self.zip_path = self.base_dir / "public_release.zip"
        self.public_dir = self.base_dir / "public"
        self.temp_dir = self.base_dir / "temp_extract_zone"

    def log(self, message: str, color: str = Colors.BLUE):
        print(f"{color}ℹ️  {message}{Colors.ENDC}")

    def clean_system_artifacts(self, target_dir: Path) -> None:
        """Removes __MACOSX and .DS_Store from extracted content."""
        macosx = target_dir / "__MACOSX"
        if macosx.exists():
            shutil.rmtree(macosx)
        
        for path in target_dir.rglob("*"):
            if path.name == ".DS_Store":
                path.unlink()

    def download_assets(self, file_id: str) -> None:
        self.log(f"Downloading assets (ID: {file_id})...", Colors.BLUE)
        try:
            url = f'https://drive.google.com/uc?id={file_id}'
            gdown.download(url, str(self.zip_path), quiet=False)
        except Exception as e:
            print(f"{Colors.FAIL}❌ Download failed: {e}{Colors.ENDC}")
            sys.exit(1)

    def install_assets(self) -> None:
        self.log("Installing assets to 'public/'...", Colors.BLUE)

        # 1. Prepare Temp
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

        # 2. Extract Zip
        try:
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.temp_dir)
        except zipfile.BadZipFile:
            print(f"{Colors.FAIL}❌ Error: Corrupted zip file.{Colors.ENDC}")
            sys.exit(1)

        # 3. Clean Junk
        self.clean_system_artifacts(self.temp_dir)

        # 4. Merge Logic: Move folders from Temp to Public
        # This preserves 'errors' folder in public if it exists.
        
        # Handle case where user zipped "public" folder itself vs zipped contents
        source_root = self.temp_dir
        if (self.temp_dir / "public").exists():
             source_root = self.temp_dir / "public"

        if not self.public_dir.exists():
            self.public_dir.mkdir()

        items_moved = 0
        for item in source_root.iterdir():
            if item.is_dir():
                dest_path = self.public_dir / item.name
                
                # Logic: If 'data' or 'images' exists in public, wipe it first to ensure clean state
                # But ONLY wipe the specific folder we are replacing, not the whole public dir
                if dest_path.exists():
                    shutil.rmtree(dest_path)
                
                shutil.move(str(item), str(dest_path))
                items_moved += 1
                self.log(f"Updated: public/{item.name}", Colors.CYAN)

        # 5. Cleanup
        shutil.rmtree(self.temp_dir)
        if self.zip_path.exists():
            self.zip_path.unlink()
            
        self.log(f"Successfully installed {items_moved} folders.", Colors.GREEN)

    def run(self):
        # Check if local zip exists
        should_download = True
        if self.zip_path.exists():
            print(f"{Colors.WARNING}❓ Found existing zip file.{Colors.ENDC}")
            choice = input(f"👉 Use local file? (Y/n): ").strip().lower()
            if choice in ['y', 'yes', 'ok', '']:
                should_download = False
            else:
                self.zip_path.unlink()

        if should_download:
            file_id = os.environ.get("GDRIVE_ID")
            if not file_id:
                file_id = input(f"👉 Enter Google Drive File ID: ").strip()
            
            if file_id:
                self.download_assets(file_id)
            else:
                print(f"{Colors.FAIL}❌ No ID provided.{Colors.ENDC}")
                return

        self.install_assets()
        print(f"\n{Colors.BOLD}{Colors.GREEN}🎉 Public folder updated!{Colors.ENDC}")

if __name__ == "__main__":
    try:
        AssetLoader().run()
    except KeyboardInterrupt:
        sys.exit(0)
        