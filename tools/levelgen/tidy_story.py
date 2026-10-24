"""One-off tidy: register the medicine chapter and turn double-quoted strings in the story files into single quotes."""
import glob, os, re

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '..', '..', 'src')

p = os.path.join(src, 'story', 'chapters.ts')
s = open(p, encoding='utf-8').read()
if 'medicine' not in s:
    s = s.replace("import { food }", "import { medicine } from './chapters/medicine';\nimport { food }")
    s = s.replace("  editing,\n  food,", "  editing,\n  medicine,\n  food,")
    open(p, 'w', encoding='utf-8', newline='').write(s)

pat = re.compile(r'^(\s+)((?:\w+: )?)"((?:[^"\\]|\\.)*)"(,|\),)$')
for f in glob.glob(os.path.join(src, 'story', 'chapters', '*.ts')):
    lines = open(f, encoding='utf-8').read().split('\n')
    n = 0
    for i, l in enumerate(lines):
        m = pat.match(l)
        if m:
            body = m.group(3).replace('\\"', '"').replace("'", "\\'")
            lines[i] = f"{m.group(1)}{m.group(2)}'{body}'{m.group(4)}"
            n += 1
    if n:
        open(f, 'w', encoding='utf-8', newline='').write('\n'.join(lines))
        print(os.path.basename(f), n)

# the map needs a colour for the new illustration kind
p = os.path.join(src, 'ui', 'story', 'StoryMap.tsx')
s = open(p, encoding='utf-8').read()
if "blood:" not in s:
    s = s.replace("  wheat: '#d9a21b',", "  wheat: '#d9a21b',\n  blood: '#b4382b',")
    open(p, 'w', encoding='utf-8', newline='').write(s)

# quorum: the squid has no drawing; use the bacterium for its first scale
p = os.path.join(src, 'data', 'levels', 'quorum.json')
s = open(p, encoding='utf-8').read()
s = s.replace('"kind": "jellyfish"', '"kind": "bacterium"', 1)
open(p, 'w', encoding='utf-8', newline='').write(s)
