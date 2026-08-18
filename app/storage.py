import os
from fastapi import HTTPException
from PIL import Image
import io

class StorageService:
    def save_file(self, file_bytes: bytes, filename: str) -> str:
        raise NotImplementedError
        
    def get_file_url(self, file_path: str) -> str:
        raise NotImplementedError

class LocalStorageService(StorageService):
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_file(self, file_bytes: bytes, filename: str) -> str:
        file_path = os.path.join(self.upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        return file_path

    def get_file_url(self, file_path: str) -> str:
        return f"/{file_path}"

# Specifications defined in reference.json
ARTWORK_SPECS = {
    "poster": {"aspect": (2, 3), "target": (600, 900), "max_kb": 200},
    "banner": {"aspect": (16, 9), "target": (1280, 720), "max_kb": 200},
    "thumbnail": {"aspect": (16, 9), "target": (640, 360), "max_kb": 200},
}

def validate_and_process_artwork(file_bytes: bytes, filename: str, artwork_type: str):
    if artwork_type not in ARTWORK_SPECS:
        raise HTTPException(status_code=400, detail="Invalid artwork type.")
    
    spec = ARTWORK_SPECS[artwork_type]
    file_size_kb = len(file_bytes) / 1024
    
    if file_size_kb > spec["max_kb"]:
        raise HTTPException(
            status_code=400, 
            detail=f"File size is {file_size_kb:.1f} KB, which exceeds the maximum limit of {spec['max_kb']} KB. Please compress your image."
        )

    try:
        image = Image.open(io.BytesIO(file_bytes))
        width, height = image.size
    except Exception:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image format.")

    # Check Aspect Ratio (allowing a tolerance for rounding errors)
    expected_w_ratio, expected_h_ratio = spec["aspect"]
    actual_ratio = width / height
    expected_ratio = expected_w_ratio / expected_h_ratio

    if abs(actual_ratio - expected_ratio) > 0.02:
        raise HTTPException(
            status_code=400, 
            detail=f"Incorrect aspect ratio for {artwork_type}. Expected {expected_w_ratio}:{expected_h_ratio} (approx {expected_ratio:.2f}), but got {width}x{height} ({actual_ratio:.2f} ratio)."
        )

    return width, height, int(file_size_kb)