#!/usr/bin/env python3
"""Validate every skill folder: SKILL.md has YAML frontmatter, `name` equals the folder, `description`
is a non-empty string of at most 1024 characters. Exit 1 on any problem."""
import os, re, sys
import yaml

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
bad = 0
count = 0
for d in sorted(os.listdir(root)):
    f = os.path.join(root, d, "SKILL.md")
    if not os.path.isfile(f):
        continue
    count += 1
    m = re.match(r"^---\n(.*?)\n---\n", open(f, encoding="utf-8").read(), re.S)
    if not m:
        print(f"{d}: no frontmatter"); bad += 1; continue
    try:
        y = yaml.safe_load(m.group(1))
    except Exception as e:
        print(f"{d}: invalid YAML ({e})"); bad += 1; continue
    if y.get("name") != d:
        print(f"{d}: name is {y.get('name')!r}, expected the folder name"); bad += 1
    desc = y.get("description")
    if not isinstance(desc, str) or not desc.strip():
        print(f"{d}: empty description"); bad += 1
    elif len(desc) > 1024:
        print(f"{d}: description is {len(desc)} characters (limit 1024)"); bad += 1
# A skill that carries a VERSION file must hold a plain X.Y.Z; signal-to-ship must carry one (an installed copy
# cannot tell whether it is current without it).
for d in sorted(os.listdir(root)):
    f = os.path.join(root, d, "VERSION")
    if os.path.isfile(os.path.join(root, d, "SKILL.md")):
        if os.path.isfile(f):
            if not re.fullmatch(r"\d+\.\d+\.\d+", open(f, encoding="utf-8").read().strip()):
                print(f"{d}: VERSION is not X.Y.Z"); bad += 1
        elif d == "signal-to-ship":
            print(f"{d}: missing VERSION file"); bad += 1
print(f"validate-skills: {count} skills, {bad} problem(s)")
sys.exit(1 if bad else 0)
