import type { Episode, GlossaryAppearance, GlossaryTerm, GlossaryTermKind } from '@/types'
import glossarySeedRaw from 'virtual:glossary-seed'
import glossaryDetailsRaw from 'virtual:glossary-details'

type MutableTerm = Omit<GlossaryTerm, 'appearances'> & {
  appearances: Map<string, GlossaryAppearance>
}

interface GlossarySeedEntry {
  term: string
  kind: GlossaryTermKind
  shortDescription: string
}

const GLOSSARY_SEED: GlossarySeedEntry[] = (() => {
  try {
    const parsed = JSON.parse(glossarySeedRaw) as GlossarySeedEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})()

const GLOSSARY_DETAILS = glossaryDetailsRaw as Record<string, string>

function toSlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function findTermReferences(text: string): string[] {
  const matches = text.matchAll(/=([A-ZÄÖÜß_]+)=/g)
  return Array.from(matches).map((match) => match[1])
}

function getDetailText(term: string): string | undefined {
  const slug = toSlug(term)
  const detail = GLOSSARY_DETAILS[slug]
  if (detail) return detail.trim()
  return undefined
}

function upsertTerm(
  terms: Map<string, MutableTerm>,
  term: string,
  kind: GlossaryTermKind,
  shortDescription: string
) {
  const existing = terms.get(term)
  if (existing) {
    if (!existing.shortDescription && shortDescription) {
      existing.shortDescription = shortDescription
    }
    return
  }

  terms.set(term, {
    term,
    slug: toSlug(term),
    kind,
    shortDescription,
    longDescription: getDetailText(term),
    appearances: new Map(),
  })
}

function addAppearance(terms: Map<string, MutableTerm>, term: string, appearance: GlossaryAppearance) {
  const entry = terms.get(term)
  if (!entry) return

  const key = `${appearance.sceneId}`
  const existing = entry.appearances.get(key)
  if (existing) {
    existing.count += appearance.count
    return
  }

  entry.appearances.set(key, { ...appearance })
}

export function buildGlossary(episodes: Episode[]): GlossaryTerm[] {
  const terms = new Map<string, MutableTerm>()

  for (const seed of GLOSSARY_SEED) {
    upsertTerm(terms, seed.term, seed.kind, seed.shortDescription)
  }

  for (const ep of episodes) {
    ep.characters.forEach((character) => {
      upsertTerm(terms, character.name, 'character', character.description)
    })
    ep.leitmotifs.forEach((motif) => {
      upsertTerm(terms, motif.name, 'motif', motif.description)
    })

    for (const scene of ep.scenes) {
      for (const block of scene.blocks) {
        if (block.type === 'dialogue') {
          addAppearance(terms, block.character, {
            sceneId: scene.id,
            episode: ep.number,
            akt: scene.akt,
            sceneTitle: scene.title,
            count: 1,
          })

          for (const line of block.lines) {
            for (const ref of findTermReferences(line)) {
              if (!terms.has(ref)) {
                upsertTerm(terms, ref, 'concept', 'Noch ohne Kurzbeschreibung.')
              }
              addAppearance(terms, ref, {
                sceneId: scene.id,
                episode: ep.number,
                akt: scene.akt,
                sceneTitle: scene.title,
                count: 1,
              })
            }
          }
        }

        if (block.type === 'narrative') {
          for (const ref of findTermReferences(block.text)) {
            if (!terms.has(ref)) {
              upsertTerm(terms, ref, 'concept', 'Noch ohne Kurzbeschreibung.')
            }
            addAppearance(terms, ref, {
              sceneId: scene.id,
              episode: ep.number,
              akt: scene.akt,
              sceneTitle: scene.title,
              count: 1,
            })
          }
        }
      }
    }
  }

  return Array.from(terms.values())
    .map((term) => ({
      term: term.term,
      slug: term.slug,
      kind: term.kind,
      shortDescription: term.shortDescription,
      longDescription: term.longDescription,
      appearances: Array.from(term.appearances.values()).sort(
        (a, b) => a.episode - b.episode || a.sceneId.localeCompare(b.sceneId)
      ),
    }))
    .sort((a, b) => a.term.localeCompare(b.term, 'de'))
}

export function formatBuildMeta() {
  const hash = import.meta.env.VITE_GIT_HASH || 'local'
  const tag = import.meta.env.VITE_GIT_TAG || 'untagged'
  const deployedAt = import.meta.env.VITE_DEPLOYED_AT || ''

  const dateLabel = deployedAt ? new Date(deployedAt).toISOString().replace('.000Z', 'Z') : 'local'
  return `commit ${hash} | tag ${tag} | deployed ${dateLabel}`
}
