# Genlab — Architecture

How the code is organised and how to extend it.

## Directory structure

```
src/
├── App.tsx                 Root: picks the screen from `gamePhase` and the board from the level mode
├── MainMenu.tsx            Story entry, free-play grid with a filter by mode
├── game/
│   ├── GameStore.ts        The Zustand store: level, phase, and the state/actions of every mode
│   ├── PuzzleEngine.ts     Pathway rules, scoring, hints
│   ├── modes/logic.ts      Pure rules of the non-pathway modes (no UI, no store)
│   ├── tours.ts            Steps of the guided tutorial of each mode
│   ├── scoring.ts, feedback.ts
├── levels/                 LevelLoader (registry), LevelSchema, LevelValidator
├── data/levels/            One JSON per level
├── biology/, simulation/   Graph of biological entities and the (gameplay) simulation
├── story/                  Story mode (see below)
├── ui/
│   ├── components/         Boards (one per mode), side panels, level-complete, tutorial card
│   ├── story/              Story map, scenes, avatars, tool icons
│   └── layout2d.ts         Geometry of the 2D pathway board
├── i18n/                   es.ts, en.ts and `localize()` for `<field>_es` data
├── types/                  level, game, biology and simulation types
├── utils/persistence.ts    localStorage save
└── tests/                  vitest
```

## Game state (`game/GameStore.ts`)

`gamePhase`: `menu → story | exploration → puzzle → simulation → complete`. The same store holds, for each mode, the state of the attempt (for example `slots`, `seqOrder`, `pairAnswer`, `cutChosen`, `asmOrder`, `crisprGuide`) and the actions the boards call (`placeInSlot`, `testSequence`, `testPairs`…). Every action that can be wrong records a mistake in the `PuzzleEngine`, which owns the score, and says what went wrong through a feedback toast.

`selectProgress()` returns `{ done, total }` for any mode, used by the top bar and the side panel.

## The modes

A level declares its mode (`mode`, default `pathway`) and the data of that mode (`construct`, `diagnose`, `sequence`, `inherit`, `mutation`, `tune`, `pairing`, `cut`, `assemble`, `crispr`). The types are in `types/level.types.ts`.

To add a mode:

1. Types: the mode in `LevelMode`, its `*Definition` and the field in `LevelData`.
2. Rules in `game/modes/logic.ts` as pure functions, with tests in `tests/modeLogic.test.ts`.
3. State and actions in `GameStore.ts` (`freshPuzzleState`, `startState`, `selectProgress`, `modeBase`).
4. A board in `ui/components/` and its case in `App.tsx`.
5. Strings in `i18n/es.ts` and `en.ts` (`modes`, the mode's block, `tour.steps`).
6. Its tutorial in `game/tours.ts` (and the highlight in `index.css`; `tests/tours.test.ts` checks both).
7. Level data checks in `tests/modes.test.ts`, and a branch in `tests/playthrough.test.ts` that solves it.

## Pathway (the original mode)

A directed graph of biological entities with strict rules for the connection types (`biology/GraphValidator`): `encodes` (gene → protein/enzyme), `catalyzes` (enzyme/protein → reaction), `consumes`/`produces` (reaction → metabolite/…), `influences`, `regulates`, `represses`, `localizes_to`. The player taps two pieces; the game orients the connection the way the level defines it and says why a wrong one is wrong. The pathway is drawn by `ui/components/Board2D.tsx`: pan, zoom and touch, cards laid out by `ui/layout2d.ts`. Levels give positions on a grid; a test checks that no two cards overlap in landscape or portrait.

## Levels

JSON files with bilingual text (`field` in English, `field_es` in Spanish) resolved with `localize()`. `LevelLoader` loads them lazily, validates the schema and the cross references, and caches them. The registry (`LEVEL_REGISTRY`) holds a summary of each level so the menu renders without loading them; it is sorted by difficulty and then by the order of the story.

## Story mode (`story/`, `ui/story/`)

Doctor Genaro (a time-travelling scientist) and the robot Pipo take the player through eras of biotechnology. Each level mode is a *tool* of the laboratory, handed over by the scene that introduces it.

- `story/dsl.ts` — the shapes (`Chapter`, `Scene`, `Line`) and the `doc()` / `robot()` helpers.
- `story/chapters/*.ts` — the script, one file per chapter. A scene may play a level and/or hand over a tool. `story/chapters.ts` lists the chapters in order.
- `story/tools.ts` — the tool ids and the level mode each one belongs to.
- `story/progress.ts` — pure functions: which scenes are done, available or locked, and which tools are unlocked. Nothing about progress is stored twice: it is derived from `completedLevels` and `storySeen`.
- `story/StoryStore.ts` — where the player is (map or scene) and which scene the level in play belongs to. It clears itself when the game goes back to the main menu.
- `ui/story/` — `StoryScreen` (shown when `gamePhase === 'story'`), `StoryMap`, `StoryScene`, and the SVG `Avatar` and `ToolIcon`.

Free play is unaffected: every level stays open. `tests/story.test.ts` checks that every level of a scene exists and is used once, both languages are filled in, and each tool is handed over exactly once with a level of its own mode.

## Tutorials (`game/tours.ts`, `ui/components/TourCard.tsx`)

Every mode has a step-by-step tutorial. A step highlights a part of the board (`data-tour-el`), and can advance by itself when the player does what it asks. They start on their own the first time a mode is played (the pathway has its own guided level and offers its tutorial on demand) and can be replayed from the left panel.

## Persistence (`utils/persistence.ts`)

`localStorage`, key `biogen_save` (the game's first name; kept so saved progress survives the rename). It stores level results, the story scenes opened (`storySeen`) and preferences. Old saves keep working because missing fields fall back to defaults.

## Tests

`npm test` runs, among others:

- data checks of every level (schema, both languages, rules of its mode);
- pure rules of the modes;
- the story data and flow;
- the 2D layout;
- `playthrough.test.ts`, which solves **every level** through the store actions, so an unsolvable level cannot be added by mistake.
