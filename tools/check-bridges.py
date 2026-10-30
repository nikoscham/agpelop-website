#!/usr/bin/env python3
"""Check the bridge CSV files in archive-data/ and print the next free bridge id.

Run from the repository root:  python3 tools/check-bridges.py
"""
import csv
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "archive-data"
COLUMNS = [
    "id", "name", "county", "municipal", "river", "location", "year", "builder",
    "status", "description", "link_url", "link_title", "link2_url", "link2_title",
]
REQUIRED = ["id", "name", "county", "municipal", "river", "status", "description"]
COUNTIES = ["Αργολίδας", "Αρκαδίας", "Αχαΐας", "Ηλείας", "Κορινθίας", "Λακωνίας", "Μεσσηνίας"]

errors = []
ids = {}

for path in sorted(DATA_DIR.glob("*.csv")):
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != COLUMNS:
            errors.append(f"{path.name}: the header row must be exactly: {','.join(COLUMNS)}")
            continue
        for line, row in enumerate(reader, start=2):
            where = f"{path.name} line {line}"
            if None in row or any(v is None for v in row.values()):
                errors.append(f"{where}: wrong number of columns (check commas and quotes)")
                continue
            for col in REQUIRED:
                if not row[col].strip():
                    errors.append(f"{where}: '{col}' is empty")
            bridge_id = row["id"].strip()
            if not bridge_id.isdigit():
                errors.append(f"{where}: id '{bridge_id}' must be a number")
            elif bridge_id in ids:
                errors.append(f"{where}: id {bridge_id} is already used in {ids[bridge_id]}")
            else:
                ids[bridge_id] = where
            if row["county"].strip() not in COUNTIES:
                errors.append(f"{where}: county '{row['county']}' must be one of: {', '.join(COUNTIES)}")
            for col in ("link_url", "link2_url"):
                if row[col].strip() and not row[col].strip().startswith("http"):
                    errors.append(f"{where}: '{col}' must start with http")

for error in errors:
    print("ERROR:", error)

numbers = sorted(int(i) for i in ids)
print(f"{len(ids)} bridges, {len(errors)} errors")
if numbers:
    print(f"Next free id: {numbers[-1] + 1}")
sys.exit(1 if errors else 0)
