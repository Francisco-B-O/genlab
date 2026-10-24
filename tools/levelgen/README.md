# Level generator

Python scripts that wrote most of the levels of Genlab from compact bilingual specs
(`B(english, spanish)`), plus the registry entries of `LevelLoader.ts`.

- `levelgen.py` — one builder per mode, early checks (valid connections, one right fix,
  no two cards in one cell…), and `write_levels(specs)`.
- `batch*.py` — the specs of each batch of levels, as examples to copy.

Run from anywhere with `python tools/levelgen/batchN.py`. They are idempotent: they rewrite
the JSON of their levels and add a registry entry only if it is missing.

The JSON files in `src/data/levels/` are the source of truth: after hand-editing a level,
do not run its batch again. Always run `npm test` afterwards: `playthrough.test.ts` solves
every level, and the mode tests check the data rules.
