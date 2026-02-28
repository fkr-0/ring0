# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side atmospheric reading app for "DER RING: NEON-VALHALLA" — a neo-noir cyberpunk retelling of Wagner's Ring Cycle. The source content lives in Org mode files at the repository root, containing the full dramatic text with characters, scenes, and leitmotifs.

## Development Commands

All commands run from the `app/` directory:

```bash
cd app
pnpm run dev      # Start dev server (opens browser automatically)
pnpm run build    # Build for production (outputs to site/)
pnpm run preview  # Preview production build
pnpm run test     # Run Vitest tests
pnpm run lint     # Lint with Biome
pnpm run format   # Format with Biome
```

## Architecture

### Source Content (Root Directory)

The dramatic content is stored in Org mode files:
- `Ep1-rheingold.org` — Episode 1: Das Rheingold
- `Ep2-Walkuere.org` — Episode 2: Die Walküre
- `Ep3-Siegfried.org` — Episode 3: Siegfried
- `Ep4-Goetterdaemmerung.org` — Episode 4: Götterdämmerung

Each org file contains:
- Character definitions (`=CHARNAME=`) with descriptions
- Leitmotifs (`=MOTIFNAME=`) with color coding
- Scene headers (`* AKT`, `** SZENE`)
- Dialogue and stage directions

### App Structure (`app/`)

- **Vite + React 19 + TypeScript** — Build system and framework
- **Tailwind CSS v4** — Styling with OKLCH color space
- **Radix UI + shadcn/ui** — Component library

Key configuration:
- `vite.config.ts` — Custom plugin imports org files from parent directory, builds to `site/`
- `src/app/globals.css` — Design tokens, dark mode, utility classes

### Org File Parsing

The `src/lib/org-parser.ts` module parses org files and extracts:
- Episodes with titles and taglines
- Characters with descriptions and episode appearances
- Leitmotifs with descriptions and color associations
- Scenes with narrative blocks and dialogues

Dialogue detection:
- Speaker names in ALL CAPS on their own line
- Optional parenthetical stage directions: `(heiser, schmeckend)`
- Following lines are dialogue text until next speaker

### Reader Components (`src/components/reader/`)

Core reading interface:
- `SceneViewer.tsx` — Main content display with scroll container
- `DialogueBlock.tsx` — Character dialogue with motif highlighting
- `NarrativeBlock.tsx` — Narrative text with clickable motif references
- `SceneHeader.tsx` — Akt and scene titles

Navigation and progress:
- `NavigationControls.tsx` — Previous/next scene and episode buttons
- `ProgressTracker.tsx` — Global progress bar and episode grid

Information sheets:
- `CharacterSheet.tsx` — Character details slide-out
- `MotifSheet.tsx` — Leitmotif explanation slide-out

Settings:
- `ReaderSettings.tsx` — Typography, theme, and display preferences

Visual effects:
- `TextureOverlay.tsx` — Film grain, vignette, corner glows
- `AnimatedBackground.tsx` — Animated gradient and wave effects

### Design Philosophy: Rheingold Neon

Visual language inspired by neo-noir cyberpunk aesthetics:
- **Colors**: Deep void (#05080c), fire orange (#ff7828), luminous gold (#fff5dc), radioactive green (#78ff64), Rhein cyan (#00b4ff)
- **Typography**: Characters in glowing orange, dialogue in warm gold, motifs in color-coded badges
- **Atmosphere**: Film grain overlay, vignette, subtle animated background waves
- **Interactions**: Smooth page transitions, hover glows, slide-out character/motif sheets

### Leitmotif Color Coding

- `fire`: Orange — FEUER, NOTHUNG
- `gold`: Amber — GOLD, general motifs
- `rhein`: Cyan — RHEIN, water references
- `radioactive`: Green — FLUCH, ALBERICH
- `blood`: Red — BLUT, TOD references

## Self-Contained PWA

The app is designed as a client-side-only PWA:
- Org files are bundled at build time via Vite virtual modules
- No backend required
- All content embedded in the JavaScript bundle (~417KB gzipped)
