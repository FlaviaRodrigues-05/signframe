import shutil
from pathlib import Path
import string

SOURCE_DIR = Path(r"C:\Users\Christina\Downloads\archive (2)\asl_alphabet_train\asl_alphabet_train")
OUTPUT_DIR = Path("public/signs/letters")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LETTERS = list(string.ascii_uppercase)

for letter in LETTERS:
    letter_dir = SOURCE_DIR / letter
    if not letter_dir.exists():
        print(f"⚠ folder not found for {letter}")
        continue
    images = sorted(letter_dir.glob("*.jpg"))
    if not images:
        print(f"⚠ no images found for {letter}")
        continue
    chosen = images[0]
    dst = OUTPUT_DIR / f"{letter}.jpg"
    shutil.copy(chosen, dst)
    print(f"✓ {letter}: copied {chosen.name}")