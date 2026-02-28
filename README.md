# ring0

Client-side reading app for a German neo-noir/cyberpunk retelling of Wagner's Ring cycle.

## Scope

- Dramatic source text is in German (`Ep1` to `Ep4`).
- Web app and repository tooling are in English.
- Internal working notes are kept in `trunk/` and excluded from git.

## Repository Layout

- `Ep1-rheingold.org` to `Ep4-Goetterdaemmerung.org`: canonical story source
- `app/`: Vite + React + TypeScript reading application
- `docs/aktuebersicht.de.md`: compact German act overview and staging notes
- `.github/workflows/deploy.yml`: GitHub Pages deployment

## Local Development

```bash
cd app
npm ci
npm run dev
```

## Build

```bash
cd app
npm run build
```

Build output is written to `app/site/`.

## Versioning

Semantic versioning is managed through `Makefile` targets:

```bash
make version
make bump-patch
make bump-minor
make bump-major
```

Version is stored in the repository root file `VERSION`.

## GitHub Pages

Deployment runs through GitHub Actions on pushes to `main`.
The workflow builds `app/` and publishes `app/site/` to GitHub Pages.
