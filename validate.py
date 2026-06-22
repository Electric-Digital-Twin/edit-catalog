#!/usr/bin/env python3
"""Validate EDiT catalog records (datasets and code projects) and emit manifests.

Run locally:  pip install jsonschema && python3 validate.py
CI runs this on every push/PR. Exits non-zero if any record is invalid or if
two records of the same type share an id. On success it writes
datasets/index.json and projects/index.json -- the manifests the site reads.
"""
import json
import sys
import glob
from jsonschema import Draft202012Validator, FormatChecker


def validate_folder(folder, schema_path, manifest_fields):
    schema = json.load(open(schema_path))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    files = [f for f in sorted(glob.glob(f"{folder}/*.json"))
             if not f.split("/")[-1].startswith("_")
             and f.split("/")[-1] != "index.json"]
    seen, manifest, ok = {}, [], True
    for f in files:
        try:
            rec = json.load(open(f))
        except json.JSONDecodeError as e:
            print(f"  FAIL {f}: invalid JSON -- {e}"); ok = False; continue
        errs = sorted(validator.iter_errors(rec), key=lambda e: list(e.path))
        rid = rec.get("id")
        if rid in seen:
            print(f"  FAIL {f}: duplicate id '{rid}' (also in {seen[rid]})"); ok = False
        seen[rid] = f
        if errs:
            ok = False
            for e in errs:
                loc = "/".join(str(p) for p in e.path) or "(root)"
                print(f"  FAIL {f}  [{loc}]: {e.message}")
        else:
            print(f"  ok   {f}  ({rid})")
            manifest.append({k: rec.get(k) for k in manifest_fields} | {"file": f.split("/")[-1]})
    return ok, manifest


def main():
    overall = True

    print("Datasets:")
    ok_d, man_d = validate_folder(
        "datasets", "schema/dataset.schema.json",
        ["id", "title", "tier", "themes"])
    overall &= ok_d

    print("\nProjects:")
    ok_p, man_p = validate_folder(
        "projects", "schema/project.schema.json",
        ["id", "title", "kind", "maturity", "themes"])
    overall &= ok_p

    print()
    if not overall:
        print("VALIDATION FAILED"); sys.exit(1)

    json.dump({"count": len(man_d), "datasets": man_d},
              open("datasets/index.json", "w"), indent=2)
    json.dump({"count": len(man_p), "projects": man_p},
              open("projects/index.json", "w"), indent=2)
    print(f"ALL VALID -- {len(man_d)} datasets, {len(man_p)} projects")


if __name__ == "__main__":
    main()
