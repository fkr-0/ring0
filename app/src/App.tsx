import { useState, useEffect, useCallback, useMemo } from 'react'
import { SceneViewer } from './components/reader/SceneViewer'
import { NavigationControls } from './components/reader/NavigationControls'
import { ProgressTracker } from './components/reader/ProgressTracker'
import { CharacterSheet } from './components/reader/CharacterSheet'
import { MotifSheet } from './components/reader/MotifSheet'
import {
  ReaderSettingsDialog,
  DEFAULT_SETTINGS,
  type ReaderSettings,
} from './components/reader/ReaderSettings'
import { TextureOverlay, AnimatedBackground } from './components/reader/TextureOverlay'
import type { Episode, Scene, Leitmotif, Character } from './types'
import { parseOrgFile } from './lib/org-parser'

// Import org files via virtual module
import ep1Content from 'virtual:org-files:Ep1-rheingold.org'
import ep2Content from 'virtual:org-files:Ep2-Walkuere.org'
import ep3Content from 'virtual:org-files:Ep3-Siegfried.org'
import ep4Content from 'virtual:org-files:Ep4-Goetterdaemmerung.org'

const EPISODE_FILES: Record<number, string> = {
  1: ep1Content as string,
  2: ep2Content as string,
  3: ep3Content as string,
  4: ep4Content as string,
}

function App() {
  // State
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [currentScene, setCurrentScene] = useState(0)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedMotif, setSelectedMotif] = useState<Leitmotif | null>(null)
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS)
  const [showHome, setShowHome] = useState(false)

  // Parse episodes on mount
  useEffect(() => {
    const parsedEpisodes: Episode[] = []
    for (let i = 1; i <= 4; i++) {
      const content = EPISODE_FILES[i]
      if (content) {
        try {
          const episode = parseOrgFile(content, i)
          parsedEpisodes.push(episode)
        } catch (e) {
          console.error(`Failed to parse episode ${i}:`, e)
        }
      }
    }
    setEpisodes(parsedEpisodes)
  }, [])

  // Computed values
  const currentEpisodeData = episodes[currentEpisode - 1]
  const currentSceneData = currentEpisodeData?.scenes[currentScene]

  // Calculate total progress
  const totalScenes = useMemo(() => {
    return episodes.reduce((sum, ep) => sum + ep.scenes.length, 0)
  }, [episodes])

  const totalScenesRead = useMemo(() => {
    let count = 0
    for (let i = 0; i < currentEpisode - 1; i++) {
      count += episodes[i]?.scenes.length || 0
    }
    count += currentScene
    return count
  }, [episodes, currentEpisode, currentScene])

  // Navigation handlers
  const handleNextScene = useCallback(() => {
    if (!currentEpisodeData) return
    if (currentScene < currentEpisodeData.scenes.length - 1) {
      setCurrentScene(currentScene + 1)
    } else if (currentEpisode < episodes.length) {
      setCurrentEpisode(currentEpisode + 1)
      setCurrentScene(0)
    }
  }, [currentEpisodeData, currentScene, currentEpisode, episodes.length])

  const handlePrevScene = useCallback(() => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1)
    } else if (currentEpisode > 1) {
      const prevEpisode = episodes[currentEpisode - 2]
      if (prevEpisode) {
        setCurrentEpisode(currentEpisode - 1)
        setCurrentScene(prevEpisode.scenes.length - 1)
      }
    }
  }, [currentScene, currentEpisode, episodes])

  const handleNextEpisode = useCallback(() => {
    if (currentEpisode < episodes.length) {
      setCurrentEpisode(currentEpisode + 1)
      setCurrentScene(0)
    }
  }, [currentEpisode, episodes.length])

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1)
      setCurrentScene(0)
    }
  }, [currentEpisode])

  const handleEpisodeClick = useCallback((episode: number) => {
    setCurrentEpisode(episode)
    setCurrentScene(0)
    setShowHome(false)
  }, [])

  // Character/Motif handlers
  const handleCharacterClick = useCallback(
    (name: string) => {
      const allCharacters = new Map<string, Character>()
      episodes.forEach((ep) => {
        ep.characters.forEach((char, charName) => {
          const existing = allCharacters.get(charName)
          if (existing) {
            existing.episodes.push(...char.episodes.filter((e) => !existing.episodes.includes(e)))
          } else {
            allCharacters.set(charName, { ...char })
          }
        })
      })

      const character = allCharacters.get(name)
      if (character) {
        setSelectedCharacter(character)
      }
    },
    [episodes]
  )

  const handleMotifClick = useCallback(
    (motifName: string) => {
      const allMotifs = new Map<string, Leitmotif>()
      episodes.forEach((ep) => {
        ep.leitmotifs.forEach((motif) => {
          if (!allMotifs.has(motif.name)) {
            allMotifs.set(motif.name, motif)
          }
        })
      })

      const motif = allMotifs.get(motifName)
      if (motif) {
        setSelectedMotif(motif)
      }
    },
    [episodes]
  )

  // Get related motifs for character
  const relatedMotifs = useMemo(() => {
    if (!selectedCharacter) return []
    const motifs: Leitmotif[] = []
    episodes.forEach((ep) => {
      ep.leitmotifs.forEach((motif) => {
        motifs.push(motif)
      })
    })
    return motifs
  }, [selectedCharacter, episodes])

  // Get related characters for motif
  const relatedCharacters = useMemo(() => {
    if (!selectedMotif) return []
    const allCharacters = new Map<string, Character>()
    episodes.forEach((ep) => {
      ep.characters.forEach((char) => {
        allCharacters.set(char.name, char)
      })
    })
    return Array.from(allCharacters.values())
  }, [selectedMotif, episodes])

  // Gather all characters for current scene
  const sceneCharacters = useMemo(() => {
    const allChars = new Map<string, Character>()
    episodes.forEach((ep) => {
      ep.characters.forEach((char, name) => {
        allChars.set(name, char)
      })
    })
    return allChars
  }, [episodes])

  // Home view
  if (showHome || !currentEpisodeData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <AnimatedBackground />
        <TextureOverlay />

        <div className="relative z-10 max-w-4xl mx-auto px-8 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-orange-400 tracking-wider uppercase mb-4">
              Der Ring
            </h1>
            <p className="text-xl text-zinc-500 font-light">ring0</p>
          </div>

          <ProgressTracker
            episodes={episodes}
            currentEpisode={currentEpisode}
            currentScene={currentScene}
            totalScenesRead={totalScenesRead}
            totalScenes={totalScenes}
            onEpisodeClick={handleEpisodeClick}
          />

          {currentEpisodeData && (
            <div className="mt-8 space-y-4">
              <h2 className="text-lg text-zinc-400">Scenes in Episode {currentEpisode}</h2>
              <div className="grid gap-2">
                {currentEpisodeData.scenes.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setCurrentScene(idx)
                      setShowHome(false)
                    }}
                    className={`text-left p-4 rounded-sm border transition-all ${
                      idx === currentScene
                        ? 'border-orange-500/50 bg-orange-500/10'
                        : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-zinc-600">{idx + 1}</span>
                      <div>
                        <p className="text-zinc-300">{scene.akt}</p>
                        <p className="text-sm text-zinc-600 mt-1">{scene.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Reading view
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-200">
      <AnimatedBackground />
      <TextureOverlay />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <button
          onClick={() => setShowHome(true)}
          className="text-zinc-600 hover:text-orange-400 transition-colors"
        >
          <h1 className="text-lg font-bold">
            EP{currentEpisode} —{' '}
            {currentEpisodeData?.title.split('—')[1]?.trim() || currentEpisodeData?.title}
          </h1>
        </button>

        <div className="flex items-center gap-2">
          <ProgressTracker
            episodes={episodes}
            currentEpisode={currentEpisode}
            currentScene={currentScene}
            totalScenesRead={totalScenesRead}
            totalScenes={totalScenes}
            onEpisodeClick={handleEpisodeClick}
          />
          <ReaderSettingsDialog settings={settings} onSettingsChange={setSettings} />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <SceneViewer
          scene={currentSceneData || null}
          characters={sceneCharacters}
          onCharacterClick={handleCharacterClick}
          onMotifClick={handleMotifClick}
          autoScroll={settings.autoScroll}
          fontSize={settings.fontSize}
          lineHeight={settings.lineHeight}
          fontFamily={settings.fontFamily}
        />
      </main>

      {/* Navigation */}
      <footer className="relative z-20">
        <NavigationControls
          canGoBack={currentEpisode > 1}
          canGoForward={currentEpisode < episodes.length}
          canGoToPrevScene={currentScene > 0 || currentEpisode > 1}
          canGoToNextScene={
            currentScene < (currentEpisodeData?.scenes.length || 0) - 1 ||
            currentEpisode < episodes.length
          }
          onBack={handlePrevEpisode}
          onForward={handleNextEpisode}
          onPrevScene={handlePrevScene}
          onNextScene={handleNextScene}
          onHome={() => setShowHome(true)}
        />
      </footer>

      {/* Sheets */}
      <CharacterSheet
        character={selectedCharacter}
        relatedMotifs={relatedMotifs}
        open={selectedCharacter !== null}
        onClose={() => setSelectedCharacter(null)}
      />

      <MotifSheet
        motif={selectedMotif}
        relatedCharacters={relatedCharacters}
        open={selectedMotif !== null}
        onClose={() => setSelectedMotif(null)}
      />
    </div>
  )
}

export default App
