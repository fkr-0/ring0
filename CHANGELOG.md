# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.3.2] - 2026-02-28

### Fixed

- Prevented touch taps on inline character references from immediately opening detail sheets
- Restored mobile usability of character/motif detail sheets (full-width layout and scrollable content)
- Disabled continuous address-bar hash updates during reading to avoid Android URL flicker

## [0.3.1] - 2026-02-28

### Added

- Mobile bottom-float term preview overlay without layout displacement
- Compact mobile bottom navigation with expandable action cluster
- Episode progress gradient with vertical episode cut markers in the bottom bar

### Changed

- Moved glossary/home/settings controls into the bottom navigation flow
- Increased readability of the active section indicator in the bottom bar
- Theme selection layout adjusted for four themes without awkward wrapping
- Updated `revolte` subtitle to "Reclaim the streets"
- Brightness constraint logic now disables `void` and `deep` (instead of `deep` and `warm`)

### Fixed

- GitHub Pages deploy workflow now fetches tags for correct release tag display in build metadata
- Removed scroll smoothing from scene container to reduce perceived scroll lag
- Fixed hover-preview layout shift/glitch by rendering preview as fixed overlay

## [0.3.0] - 2026-02-28

### Added

- Bottom navigation unifying glossary, home, settings, and quick jump marker access
- Persistent reading anchors with copyable deep links and "jump to last position" flow
- Glossary content source moved to repository root (`glossary/seed.de.json`, `glossary/details/*.md`)
- Searchable glossary detail flow with appearance references and scene jump integration
- Build metadata display in UI footer (commit hash, tag, deploy timestamp)
- New visual theme `revolte` (deep blue-violet base with neon orange accents)

### Changed

- Reader default typography switched to monospace
- Theme settings now include a brightness slider with subtle background lift and stronger accent lift
- Theme constraints: `deep` and `warm` are disabled when brightness is above zero
- Reader panels and overlays now react consistently to theme and brightness configuration
- Character info interactions moved from pure hover tooltips toward fixed-position preview behavior

### Fixed

- Org parser now correctly handles character extraction from `Besetzung` lines using `=NAME=` patterns
- Org parser now closes dialogue blocks on empty lines (prevents narrative text from being appended to speech)
- UI consistency improvements for glossary/detail return navigation behavior

## [0.1.1] - 2026-02-28

### Added

- For now: Change title to `ring0`
- Repository scaffolding for GitHub Pages deployment
- Semantic versioning Makefile targets
- German act overview and staging guidance in `docs/aktuebersicht.de.md`
- Build metadata in UI footer (commit hash, tag, deploy timestamp)
- Initial glossary system with searchable index and generated detail views
- Optional glossary detail overrides via `app/src/glossary/details/*.md`
- Character tooltips in reader blocks

## [0.1.0] - 2026-02-28

### Added

- Initial Org-mode dramatic text for all four episodes
- Initial Vite/React reading app implementation
