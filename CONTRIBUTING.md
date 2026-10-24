# Contributing

## Branches

| Branch | Purpose |
|---|---|
| `main` | Stable code. Every push runs the tests and publishes the game on `gh-pages`. |
| `develop` | Where work is integrated. Starts from `main`, goes back to `main` when it is ready. |
| `gh-pages` | The built game, nothing else. Written by the deploy workflow; do not edit by hand. |

Short-lived work goes in `feature/<what>` or `fix/<what>`, branched from `develop` and merged back into it.

## Commits

Small commits with a prefix: `feat:`, `fix:`, `docs:`, `chore:`, `style:`, `test:`, `refactor:`.

## Before pushing

```bash
npm test          # includes a playthrough of every level
npm run build     # type check + production build
```

## Adding content

See "Adding content" in the README and the tools in `tools/levelgen/`.
