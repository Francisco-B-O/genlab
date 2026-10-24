"""Re-sorts LEVEL_REGISTRY by difficulty and then by the order of the story (levels outside the story go last)."""
import os, re

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '..', '..', 'src')
p = os.path.join(src, 'levels', 'LevelLoader.ts')
s = open(p, encoding='utf-8').read()
head = 'const LEVEL_REGISTRY: LevelIndexEntry[] = [\n'
a = s.index(head) + len(head)
b = s.index('\n];\n', a) + 1
body = s[a:b]
blocks = re.split(r'(?<=\n  },\n)(?=  \{\n)', body)
assert ''.join(blocks) == body

chapters = open(os.path.join(src, 'story', 'chapters.ts'), encoding='utf-8').read()
order = re.findall(r"import \{ (\w+) \} from './chapters/(\w+)'", chapters)
story = []
listed = re.search(r'CHAPTERS: Chapter\[\] = \[(.*?)\];', chapters, re.S).group(1)
for name in re.findall(r'\w+', listed):
    f = [file for var, file in order if var == name][0]
    text = open(os.path.join(src, 'story', 'chapters', f + '.ts'), encoding='utf-8').read()
    story += re.findall(r"level: ['\"]([^'\"]+)['\"]", text)

rank = {'beginner': 0, 'intermediate': 1, 'advanced': 2}


def key(block):
    level_id = re.search(r"id: '([^']+)'", block).group(1)
    difficulty = re.search(r"difficulty: '(\w+)'", block).group(1)
    return (rank[difficulty], story.index(level_id) if level_id in story else 10000)


blocks.sort(key=key)
open(p, 'w', encoding='utf-8', newline='').write(s[:a] + ''.join(blocks) + s[b:])
print('sorted', len(blocks))
