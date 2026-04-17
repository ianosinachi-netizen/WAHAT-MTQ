import os
import re

locales_dir = 'src/locales'
files = [f for f in os.listdir(locales_dir) if f.endswith('.ts')]

for filename in files:
    path = os.path.join(locales_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find keys in "key": "value" format
    keys = re.findall(r'"([^"]+)":', content)
    
    seen = set()
    dupes = []
    for k in keys:
        if k in seen:
            dupes.append(k)
        seen.add(k)
    
    if dupes:
        print(f"Duplicates in {filename}:")
        for d in dupes:
            print(f"  - {d}")
    else:
        print(f"No duplicates in {filename}")
