"""Prepara a demonstração estática, sem painel, documentos ou dados de conta."""
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public"
FILES = ("index.html", "style.css", "script.js", "firebase-config.js", ".nojekyll")

config = (ROOT / "firebase-config.js").read_text(encoding="utf-8")
for key in ("apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"):
    if not re.search(r'\b' + key + r'\s*:\s*["\x27]["\x27]', config):
        raise SystemExit("A demonstração exige firebase-config.js vazio. Nenhum arquivo foi preparado.")

for name in FILES:
    if not (ROOT / name).is_file() or (ROOT / name).is_symlink():
        raise SystemExit("Arquivo esperado ausente ou inválido: " + name)

assets = sorted((ROOT / "assets").rglob("*"))
if any(p.is_symlink() for p in assets):
    raise SystemExit("A pasta assets não deve conter links simbólicos.")

# public/ contém apenas a saída gerada por este script.
if OUTPUT.exists():
    if OUTPUT.is_symlink() or not (OUTPUT / ".juana-generated").is_file():
        raise SystemExit("public/ já existe e não foi gerada por este script.")
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()
(OUTPUT / ".juana-generated").write_text("Saída local gerada.\n", encoding="utf-8")
for name in FILES:
    shutil.copy2(ROOT / name, OUTPUT / name)
(OUTPUT / "data").mkdir()
shutil.copy2(ROOT / "data/catalogo-demo.js", OUTPUT / "data/catalogo-demo.js")
extensions = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".ico"}
for source in assets:
    if source.is_file() and source.suffix.lower() in extensions:
        destination = OUTPUT / source.relative_to(ROOT)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
print("Demonstração preparada em public/. Nenhuma publicação foi realizada.")
