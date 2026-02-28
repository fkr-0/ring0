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

const CHARACTER_LINE_REGEX = /^- (.+?) — (.+)$/
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
      const charMatch = line.match(CHARACTER_LINE_REGEX)
      if (charMatch) {
        const namesPart = charMatch[1].trim()
        const description = charMatch[2].trim()

        const inlineNames = Array.from(namesPart.matchAll(/=([A-ZÄÖÜß_]+)=/g)).map((m) => m[1])
        const fallbackNames =
          inlineNames.length > 0
            ? inlineNames
            : namesPart
                .split('/')
                .map((part) => part.trim().replace(/[^A-ZÄÖÜß_]/g, ''))
                .filter(Boolean)

        fallbackNames.forEach((name) => {
          episode.characters.set(name, {
            name,
            description,
            episodes: [episodeNumber],
          })
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
      const lastBlock = currentBlock[currentBlock.length - 1]

      // Empty line ends active dialogue blocks.
      // We inject an empty narrative spacer so following prose is not appended to speech.
      if (!trimmedLine) {
        if (lastBlock?.type === 'dialogue') {
          const prevBlock = currentBlock[currentBlock.length - 1]
          const hasSpacer = prevBlock?.type === 'narrative' && prevBlock.text === ''
          if (!hasSpacer) {
            currentBlock.push({
              type: 'narrative',
              text: '',
            })
          }
        }
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
          if (!lastBlock.text) {
            lastBlock.text = trimmedLine
          } else {
            lastBlock.text += ' ' + trimmedLine
          }
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
