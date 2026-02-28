/**
 * Org mode parser for Nibelungen files
 * Parses episodes, scenes, characters, leitmotifs, and dialogue
 */

import type {
  Episode,
  Scene,
  ContentBlock,
  DialogueLine,
  NarrativeBlock,
  SceneHeader,
  Character,
  Leitmotif,
} from '@/types'

const CHARACTER_REGEX = /^- ([A-ZÄÖÜß]+) = (.+) — (.+)$/
const MOTIF_REGEX = /^- ([A-ZÄÖÜß_]+) : : (.+)$/
const DIALOGUE_SPEAKER_REGEX = /^([A-ZÄÖÜ][A-ZÄÖÜ\s\-]+)$/
const STAGE_DIRECTION_REGEX = /^\(([^)]+)\)$/
const EPISODE_HEADER = /^\* EPISODE (\d+) — (.+)$/
const AKT_HEADER = /^\* AKT \d+ — (.+)$/
const SZENE_HEADER = /^\*\* SZENE [\d.]+ — (.+)$/

export function parseOrgFile(content: string, episodeNumber: number): Episode {
  const lines = content.split('\n')
  const episode: Episode = {
    number: episodeNumber,
    title: '',
    tagline: '',
    characters: new Map(),
    leitmotifs: new Map(),
    scenes: [],
  }

  console.log(`[parseOrgFile] Parsing episode ${episodeNumber}, ${lines.length} lines`)

  let currentScene: Scene | null = null
  let inBesetzung = false
  let inLeitmotifs = false
  let currentBlock: ContentBlock[] = []
  let aktTitle = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Episode header
    const episodeMatch = line.match(EPISODE_HEADER)
    if (episodeMatch) {
      episode.title = episodeMatch[2]
      continue
    }

    // Tagline
    if (line.startsWith('*Tagline:')) {
      episode.tagline = line.replace('*Tagline:', '').trim()
      continue
    }

    // Besetzung section
    if (line.includes('Besetzung')) {
      inBesetzung = true
      inLeitmotifs = false
      continue
    }

    // Leitmotifs section
    if (line.includes('Leitmotive')) {
      inLeitmotifs = true
      inBesetzung = false
      continue
    }

    // Separator
    if (line === '---') {
      inBesetzung = false
      inLeitmotifs = false
      continue
    }

    // Parse character
    if (inBesetzung) {
      const charMatch = line.match(CHARACTER_REGEX)
      if (charMatch) {
        const [, name, shortDesc, fullDesc] = charMatch
        episode.characters.set(name, {
          name,
          description: fullDesc.trim(),
          episodes: [episodeNumber],
        })
      }
      continue
    }

    // Parse leitmotif
    if (inLeitmotifs) {
      const motifMatch = line.match(/^- =([A-ZÄÖÜß_]+)= : (.+)$/)
      if (motifMatch) {
        const [, name, description] = motifMatch
        // Determine color based on motif name
        let color: Leitmotif['color'] = 'gold'
        if (name === 'FLUCH' || name === 'ALBERICH') color = 'radioactive'
        else if (name === 'RHEIN' || name.includes('WASSER')) color = 'rhein'
        else if (name === 'GOLD') color = 'gold'
        else if (name === 'FEUER' || name === 'NOTHUNG') color = 'fire'
        else if (name === 'BLUT' || name === 'TOD') color = 'blood'

        episode.leitmotifs.set(name, {
          name,
          description: description.trim(),
          color,
        })
      }
      continue
    }

    // Akt header
    const aktMatch = line.match(AKT_HEADER)
    if (aktMatch) {
      aktTitle = aktMatch[1]
      continue
    }

    // Scene header
    const sceneMatch = line.match(SZENE_HEADER)
    if (sceneMatch) {
      // Save previous scene
      if (currentScene && currentBlock.length > 0) {
        currentScene.blocks = currentBlock
        episode.scenes.push(currentScene)
      }

      const location = sceneMatch[1]
      const sceneId = `ep${episodeNumber}-s${episode.scenes.length + 1}`
      currentScene = {
        id: sceneId,
        episode: episodeNumber,
        akt: aktTitle,
        title: location,
        location,
        blocks: [],
      }
      currentBlock = [{ type: 'scene', akt: aktTitle, scene: location, location }]
      continue
    }

    // Parse content within scenes
    if (currentScene) {
      const trimmedLine = lines[i].trimRight()

      // Empty line - skip but preserve paragraph separation
      if (!trimmedLine) {
        continue
      }

      // Character dialogue speaker
      const speakerMatch = trimmedLine.match(DIALOGUE_SPEAKER_REGEX)
      if (speakerMatch) {
        // Check if next line is stage direction
        let stageDirection: string | undefined
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim()
          const dirMatch = nextLine.match(STAGE_DIRECTION_REGEX)
          if (dirMatch) {
            stageDirection = dirMatch[1]
            i++ // Skip the stage direction line
          }
        }

        // Start new dialogue block
        const character = speakerMatch[1].trim()
        currentBlock.push({
          type: 'dialogue',
          character,
          stageDirection,
          lines: [],
        })
        continue
      }

      // Stage direction (standalone)
      const dirMatch = trimmedLine.match(STAGE_DIRECTION_REGEX)
      if (dirMatch && currentBlock.length > 0) {
        const lastBlock = currentBlock[currentBlock.length - 1]
        if (lastBlock.type === 'dialogue') {
          lastBlock.stageDirection = dirMatch[1]
        }
        continue
      }

      // Check if this continues dialogue or is narrative
      const lastBlock = currentBlock[currentBlock.length - 1]
      if (lastBlock?.type === 'dialogue') {
        // Check if this looks like it belongs to the dialogue
        // (not a new character name, not empty)
        if (!trimmedLine.match(DIALOGUE_SPEAKER_REGEX) && !trimmedLine.match(SZENE_HEADER)) {
          lastBlock.lines.push(trimmedLine)
          continue
        }
      }

      // Narrative text
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        // Merge with previous narrative block or create new
        if (lastBlock?.type === 'narrative') {
          lastBlock.text += ' ' + trimmedLine
        } else {
          currentBlock.push({
            type: 'narrative',
            text: trimmedLine,
          })
        }
      }
    }
  }

  // Don't forget the last scene
  if (currentScene && currentBlock.length > 0) {
    currentScene.blocks = currentBlock
    episode.scenes.push(currentScene)
  }

  return episode
}

/**
 * Parse character references in text (e.g., =ALBERICH=)
 */
export function findCharacterReferences(text: string): string[] {
  const matches = text.matchAll(/=([A-ZÄÖÜß]+)=/g)
  return Array.from(matches).map((m) => m[1])
}

/**
 * Parse leitmotif references in text (e.g., =GOLD=)
 */
export function findMotifReferences(text: string): string[] {
  const matches = text.matchAll(/=([A-ZÄÖÜß_]+)=/g)
  return Array.from(matches).map((m) => m[1])
}
