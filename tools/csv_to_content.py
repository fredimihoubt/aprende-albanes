#!/usr/bin/env python3
import csv, json, sys, collections
# Usage: python csv_to_content.py input.csv output_content.json
inp = sys.argv[1]; out = sys.argv[2] if len(sys.argv)>2 else "content.json"
levels = collections.defaultdict(lambda: {"words":[], "phrases":[], "themes":[]})
with open(inp, newline="", encoding="utf-8") as f:
    rdr = csv.DictReader(f)
    for row in rdr:
        lvl = (row.get("level") or "A1").strip().upper()
        typ = (row.get("type") or "word").strip().lower()
        cat = (row.get("category") or "").strip()
        rec = {"sq": row.get("sq","").strip(), "pl": row.get("pl","").strip(), "es": row.get("es","").strip()}
        img = (row.get("img") or "").strip()
        if img: rec["img"] = img
        if typ == "word": levels[lvl]["words"].append(rec)
        elif typ == "phrase": levels[lvl]["phrases"].append(rec)
        if cat and not any(t.get("id")==cat for t in levels[lvl]["themes"]):
            levels[lvl]["themes"].append({"id":cat, "name":cat.capitalize(), "img": img or "img/people.png"})
data = {k: levels[k] for k in sorted(levels.keys())}
with open(out, "w", encoding="utf-8") as fo:
    json.dump(data, fo, ensure_ascii=False, indent=2)
print("Generado:", out)
