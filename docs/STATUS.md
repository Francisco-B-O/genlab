# Genlab — Project status

Last update: 2026-10-24.

## What exists

- **155 levels in 11 modes**: pathway, diagnose, construct, sequence, inherit, mutation, tune, pairing, cut, assemble, crispr. One JSON per level in `src/data/levels/`, registered in `src/levels/LevelLoader.ts`.
- **Story mode**: Doctor Genaro and the robot Pipo; 15 chapters and 156 scenes in `src/story/chapters/*.ts` (the one on health holds the medical levels), 11 tools handed over by scenes. Free play keeps every level open.
- **Help everywhere**: guided tutorial per mode (starts by itself the first time), a Help button in every level (`HelpModal`) and in the menu, glossary per mode, first-visit tip on the story map.
- **Real-case levels** (batches 4a/4b, 26 levels): Pasteur's flask, Hershey–Chase, Meselson–Stahl, Sanger, beer and sourdough fermentation, polled cattle, tomato colour, GFP65, rice dwarfing, bioluminescence, PHA bioplastic, nitrogen fixation, quorum sensing, ice-minus bacteria, Flavr Savr, oil-eating bacteria, rice SWEET CRISPR. All DOIs were checked against Crossref. Sequences and numeric settings are illustrative on purpose (each level says so in its "simplified" notes).
- **Everyday cases** (batch 5, 41 levels): earwax, Siamese cats, palomino horses, a three-allele rabbit, calico cats and white-eyed flies (inheritance, the last two on the X chromosome), bitter broccoli, red hair, white tigers, dog fur, double-muscled cattle and Green Revolution wheat (mutation), a DNA barcode, the start of GFP and of insulin and PCR primers (pairing), cheese, wine, fish barcoding, a DNA test for a cat and the road of a new crop (sequence), an apple that browns, jeans washed by a fungus, kimchi, cocoa and stevia (pathways), rennet and a sweet protein from microbes (construct), the genes of rennet, burger protein and jeans enzyme (cut), a compost heap, kimchi and a dairy (tune), mammoth, yeast and Neandertal genomes (assemble) and an edited mushroom, waxy corn, tomato and pig (CRISPR). Specs are in `tools/levelgen/batch5a.py`, `batch5b.py`, `batch5c.py` (shared helpers in `specs5.py`) and the scenes in `story_batch5.py` and `story_batch6.py`. DOIs were checked against Crossref; sequences are illustrative.
- **Frameshift and two-gene levels**: `mut-crispr-edit` (an extra letter after a Cas9 cut) and `mut-belgian` (a lost letter in the myostatin gene) use the new insertion/deletion rule of the mutation mode (`mutationKind`, `mutationSites` in `game/modes/logic.ts`); `inh-dihybrid-peas`, `-tomato` and `-cat` give a Punnett square for each gene and ask for the product of the two chances (`InheritDefinition.second`, `inheritAnswer`). Specs in `tools/levelgen/batch5h.py` and `batch5i.py`, scenes in `story_batch7.py`.
- **Tests**: `npx vitest run` (1767 tests) includes `playthrough.test.ts`, which solves every level through the store; `story.test.ts` checks scenes, tools and bilingual text.

## How to extend

- New levels: write a spec in `tools/levelgen/` (see `batch4a.py`, `batch4b.py`, `README.md`) and run it; it writes the JSON and the registry entry. Then add the level to a scene (`tools/levelgen/story_batch4.py` shows how) — every level may appear in at most one scene.
- New scenes: edit `src/story/chapters/<chapter>.ts`; the last scene of a chapter carries the transition to the next one.
- New mode: see the checklist in `ARCHITECTURE.md`.

## Tools

- `tools/levelgen/` — level builders and batches (`batch4a.py`, `batch4b.py`), story scenes (`story_batch4.py`, `story_health.py`), `sort_registry.py` (difficulty, then story order; run it after adding levels).
- `tools/build_single_file.py <dir>` — builds the game as one html file to publish as a page.

## Known limits / ideas

- All 155 levels are in the story now. Character names are final (Doctor Genaro, Pipo); the art is still simple.
- Ideas: more eras (vaccines, fermented drinks around the world), more real cases per mode, a final "free lab" scene that links to free play.
