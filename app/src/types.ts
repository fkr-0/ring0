/**
 * Core types for the Nibelungen reader app
 */

export interface Character {
  name: string
  description: string
  episodes: number[] // Which episodes this character appears in
}

export interface Leitmotif {
  name: string
  description: string
  color?: 'fire' | 'gold' | 'rhein' | 'neon' | 'radioactive' | 'blood'
}

export interface DialogueLine {
  type: 'dialogue'
  character: string
  stageDirection?: string
  lines: string[]
}

export interface NarrativeBlock {
  type: 'narrative'
  text: string
}

export interface SceneHeader {
  type: 'scene'
  akt: string
  scene: string
  location?: string
}

export type ContentBlock = DialogueLine | NarrativeBlock | SceneHeader

export interface Scene {
  id: string
  episode: number
  akt: string
  title: string
  location?: string
  blocks: ContentBlock[]
}

export interface Episode {
  number: number
  title: string
  tagline: string
  characters: Map<string, Character>
  leitmotifs: Map<string, Leitmotif>
  scenes: Scene[]
}

export interface ReaderState {
  currentEpisode: number
  currentScene: number
  currentBlock: number
  progress: number // 0-1
}

export interface AppearanceData {
  character: string
  count: number
  firstScene: number
}
