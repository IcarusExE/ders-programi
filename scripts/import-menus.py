#!/usr/bin/env python3
import json
import re
import sys
from collections import Counter
from datetime import date, datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

NAMESPACE = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
DATE_ORIGIN = datetime(1899, 12, 30)


def read_workbook(path):
    with ZipFile(path) as workbook:
        shared_root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
        shared = [
            "".join(node.text or "" for node in item.iter(NAMESPACE + "t")).strip()
            for item in shared_root.findall(NAMESPACE + "si")
        ]
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))

    rows = []
    for row in sheet.findall(".//" + NAMESPACE + "row"):
        cells = {}
        for cell in row.findall(NAMESPACE + "c"):
            reference = cell.attrib.get("r", "")
            column_match = re.match(r"[A-Z]+", reference)
            value = cell.find(NAMESPACE + "v")
            if not column_match or value is None or column_match.group() > "F":
                continue
            raw_value = value.text or ""
            cells[column_match.group()] = shared[int(raw_value)] if cell.attrib.get("t") == "s" else raw_value
        if cells:
            rows.append(cells)
    return rows


def excel_date(raw_value):
    try:
        serial = float(raw_value)
    except (TypeError, ValueError):
        return None
    if not 45000 < serial < 50000:
        return None
    return (DATE_ORIGIN + timedelta(days=serial)).date()


def parse_meals(path, meal_name):
    parsed_rows = []
    for row in read_workbook(path):
        meal_date = excel_date(row.get("A"))
        if not meal_date:
            continue
        items = [row[column].strip() for column in ("B", "C", "D", "E") if row.get(column, "").strip()]
        if not items:
            continue
        parsed_rows.append({"date": meal_date, "items": items, "calories": row.get("F", "").strip() or None})

    dominant_period = Counter((row["date"].year, row["date"].month) for row in parsed_rows).most_common(1)[0][0]
    normalized = []
    for row in parsed_rows:
        meal_date = row["date"]
        if (meal_date.year, meal_date.month) != dominant_period:
            corrected = date(dominant_period[0], dominant_period[1], meal_date.day)
            print(f"Uyarı: {meal_name} tarihi {meal_date.isoformat()} -> {corrected.isoformat()} olarak düzeltildi.", file=sys.stderr)
            meal_date = corrected
        note = row["items"][0] if len(row["items"]) == 1 and re.search(r"tatil|bayram", row["items"][0], re.I) else None
        calories = row["calories"]
        item_calories = [int(value) for value in re.findall(r"\((\d+)\s*kkal\)", " ".join(row["items"]), re.I)]
        declared_match = re.search(r"\d+", calories or "")
        if item_calories and declared_match and sum(item_calories) != int(declared_match.group()):
            print(
                f"Uyarı: {meal_date.isoformat()} {meal_name} toplamı "
                f"{declared_match.group()} yerine {sum(item_calories)} olarak hesaplandı.",
                file=sys.stderr,
            )
            calories = f"{sum(item_calories)} KKAL"
        normalized.append({
            "date": meal_date.isoformat(),
            "meal": {"items": [] if note else row["items"], "note": note, "calories": calories},
        })
    return normalized, dominant_period


def main():
    if len(sys.argv) != 4:
        raise SystemExit("Kullanım: import-menus.py OGLE.xlsx AKSAM.xlsx CIKTI.json")

    lunch_rows, lunch_period = parse_meals(Path(sys.argv[1]), "Öğle")
    dinner_rows, dinner_period = parse_meals(Path(sys.argv[2]), "Akşam")
    if lunch_period != dinner_period:
        raise SystemExit("Öğle ve akşam menüleri aynı aya ait olmalı.")

    days = {}
    for entry in lunch_rows:
        days.setdefault(entry["date"], {"date": entry["date"], "lunch": None, "dinner": None})["lunch"] = entry["meal"]
    for entry in dinner_rows:
        days.setdefault(entry["date"], {"date": entry["date"], "lunch": None, "dinner": None})["dinner"] = entry["meal"]

    output = {
        "source": "Ankara Üniversitesi Sağlık, Kültür ve Spor Daire Başkanlığı",
        "period": f"{lunch_period[0]:04d}-{lunch_period[1]:02d}",
        "updatedAt": date.today().isoformat(),
        "days": [days[key] for key in sorted(days)],
    }
    Path(sys.argv[3]).write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(output['days'])} gün {sys.argv[3]} dosyasına yazıldı.")


if __name__ == "__main__":
    main()
