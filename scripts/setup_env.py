#!/usr/bin/env python3
"""Interactive environment bootstrap for MYSSP notebooks."""

from __future__ import annotations

import os
import subprocess
import sys
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENV_DIR = ROOT / ".venv"
REQ_CORE = ROOT / "requirements.txt"
REQ_TRANSLATE = ROOT / "requirements-translate.txt"
DATASETS = ROOT / "datasets"

NOTEBOOKS = [
    ("1", "English BERT baseline", ROOT / "notebooks/baselines/basic_bert_classifier.ipynb"),
    ("2", "EAT / TOGA translation (optional GPU)", ROOT / "notebooks/translation/Translate.ipynb"),
    ("3", "MYBully focal-loss baseline", ROOT / "notebooks/baselines/mybully.ipynb"),
    ("4", "Full MEPC–EAT experiment", ROOT / "notebooks/mepc/mepc.ipynb"),
    ("5", "MEPC ablation (MYBully-only Malay)", ROOT / "notebooks/mepc/mepc-hungry.ipynb"),
]


def ask(prompt: str, default: str = "y") -> str:
    hint = default.upper() if default.lower() == "y" else default
    raw = input(f"{prompt} [{hint}]: ").strip().lower()
    return raw or default.lower()


def yes(prompt: str, default: str = "y") -> bool:
    return ask(prompt, default).startswith("y")


def venv_python() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def run(cmd: list[str]) -> None:
    print(">", " ".join(cmd))
    subprocess.check_call(cmd, cwd=ROOT)


def ensure_venv() -> Path:
    py = venv_python()
    if py.is_file():
        print(f"Using existing virtualenv: {VENV_DIR}")
        return py
    if not yes(f"Create virtualenv at {VENV_DIR}?"):
        print("Aborted.")
        sys.exit(1)
    print(f"Creating {VENV_DIR} ...")
    venv.EnvBuilder(with_pip=True).create(VENV_DIR)
    return py


def install(py: Path, translate: bool) -> None:
    run([str(py), "-m", "pip", "install", "--upgrade", "pip"])
    req = REQ_TRANSLATE if translate else REQ_CORE
    if not req.is_file():
        raise FileNotFoundError(req)
    run([str(py), "-m", "pip", "install", "-r", str(req)])


def verify(py: Path, translate: bool) -> None:
    modules = [
        "torch",
        "transformers",
        "sklearn",
        "pandas",
        "matplotlib",
        "seaborn",
        "jupyter",
        "ipywidgets",
    ]
    if translate:
        modules.append("bitsandbytes")
    code = (
        "import importlib.util, sys\n"
        f"mods = {modules!r}\n"
        "missing = [m for m in mods if importlib.util.find_spec(m) is None]\n"
        "print('Python', sys.version.split()[0])\n"
        "print('OK:', ', '.join(m for m in mods if m not in missing))\n"
        "if missing:\n"
        "    print('MISSING:', ', '.join(missing))\n"
        "    raise SystemExit(1)\n"
        "import torch\n"
        "print('CUDA available:', torch.cuda.is_available())\n"
        "if torch.cuda.is_available():\n"
        "    print('CUDA device:', torch.cuda.get_device_name(0))\n"
    )
    print("\nVerifying imports ...")
    run([str(py), "-c", code])


def check_datasets() -> None:
    expected = ["goemotions", "goms", "mybully", "cmed", "emotion_counts.csv"]
    print("\nChecking datasets/ ...")
    if not DATASETS.is_dir():
        print(f"MISSING: {DATASETS}")
        return
    for name in expected:
        path = DATASETS / name
        status = "ok" if path.exists() else "MISSING"
        print(f"  [{status}] {name}")


def print_next_steps(py: Path) -> None:
    activate = (
        str(VENV_DIR / "Scripts" / "Activate.ps1")
        if os.name == "nt"
        else f"source {VENV_DIR / 'bin' / 'activate'}"
    )
    print("\n" + "=" * 60)
    print("Setup complete. Suggested interactive workflow:")
    print("=" * 60)
    print(f"1. Activate:  {activate}")
    print(f"2. Launch:    {py} -m jupyter notebook")
    print("3. Open notebooks in this order:\n")
    for key, title, path in NOTEBOOKS:
        rel = path.relative_to(ROOT)
        print(f"   {key}. {title}")
        print(f"      {rel}")
    print("\nTip: prepared GoMS lives in datasets/goms/ — skip Translate.ipynb unless regenerating.")
    print("MEPC notebooks auto-discover datasets/ from the repo root.")


def main() -> None:
    print("MYSSP interactive setup")
    print(f"Repo root: {ROOT}\n")

    translate = yes("Install translation extras (bitsandbytes / Qwen EAT)?", default="n")
    py = ensure_venv()

    if yes("Install Python packages now?"):
        install(py, translate=translate)
    else:
        print("Skipping pip install.")

    if yes("Run import / CUDA verification?", default="y"):
        verify(py, translate=translate)

    check_datasets()
    print_next_steps(py)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nInterrupted.")
        sys.exit(130)
    except subprocess.CalledProcessError as exc:
        print(f"\nCommand failed with exit code {exc.returncode}")
        sys.exit(exc.returncode)
