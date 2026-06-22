#!/usr/bin/env python3
"""Validate every EDiT dataset record against the schema, and emit a manifest.

Run locally:  pip install jsonschema && python3 validate.py
CI runs this on every push/PR. It exits non-zero if any record is invalid or
if two records share an id. On success it writes datasets/index.json, the
manifest the Pages front-end reads to know which records exist.
"""
import json
import sys
import glob
from jsonschema import Draft202012Validator, FormatChecker

SCHEMA_PATH = "schema/dataset.schema.json"


def main():
    schema = json.load(open(SCHEMA_PATH))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    files = [f for f in sorted(glob.glob("datasets/*.json"))
             if not f.split("/")[-1].startswith("_")
             and f.split("/")[-1] != "index.json"]

    seen_ids = {}
    manifest = []
    ok = True

    for f in files:
        try:
            rec = json.load(open(f))
        except json.JSONDecodeError as e:
            print(f"  FAIL {f}: invalid JSON -- {e}")
            ok = False
            continue

        errs = sorted(validator.iter_errors(rec), key=lambda e: list(e.path))
        rid = rec.get("id")

        if rid in seen_ids:
            print(f"  FAIL {f}: duplicate id '{rid}' (also in {seen_ids[rid]})")
            ok = False
        seen_ids[rid] = f

        if errs:
            ok = False
            for e in errs:
                loc = "/".join(str(p) for p in e.path) or "(root)"
                print(f"  FAIL {f}  [{loc}]: {e.message}")
        else:
            print(f"  ok   {f}  ({rid})")
            manifest.append({
                "id": rid,
                "file": f.split("/")[-1],
                "title": rec.get("title"),
                "tier": rec.get("tier"),
                "themes": rec.get("themes", []),
            })

    print()
    if not ok:
        print("VALIDATION FAILED")
        sys.exit(1)

    with open("datasets/index.json", "w") as fh:
        json.dump({"count": len(manifest), "datasets": manifest}, fh, indent=2)
    print(f"ALL VALID -- wrote datasets/index.json ({len(manifest)} records)")


if __name__ == "__main__":
    main()
