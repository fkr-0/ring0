import { useState, useEffect, useCallback, useMemo } from 'react'
import { SceneViewer } from './components/reader/SceneViewer'
import { NavigationControls } from './components/reader/NavigationControls'
import { ProgressTracker } from './components/reader/ProgressTracker'
import { CharacterSheet } from './components/reader/CharacterSheet'
import { MotifSheet } from './components/reader/MotifSheet'
import { GlossaryPanel } from './components/reader/GlossaryPanel'
import { GlossaryDetail } from './components/reader/GlossaryDetail'
import {
  ReaderSettingsDialog,
  DEFAULT_SETTINGS,
  type ReaderSettings,
} from './components/reader/ReaderSettings'
import { TextureOverlay, AnimatedBackground } from './components/reader/TextureOverlay'
import type { Episode, Leitmotif, Character, GlossaryTerm } from './types'
import { parseOrgFile } from './lib/org-parser'
import { buildGlossary, formatBuildMeta } from './lib/glossary'

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

const SETTINGS_STORAGE_KEY = 'ring0.reader.settings'
const LAST_ANCHOR_STORAGE_KEY = 'ring0.reader.last-anchor'

type GlossaryReturnView = 'home' | 'reading'

function sceneIdFromAnchor(anchorId: string): string | null {
  const match = anchorId.match(/^(ep\d+-s\d+)-b\d+/)
  return match ? match[1] : null
}

function parseAnchorParts(anchorId: string) {
  const match = anchorId.match(/^ep(\d+)-s(\d+)-b(\d+)-(?:p|l)(\d+)$/)
  if (!match) return null
  return {
    episode: Number(match[1]),
    scene: Number(match[2]),
    block: Number(match[3]),
    part: Number(match[4]),
  }
}

function toMarkerCode(
  anchorId: string,
  episodes: Episode[]
): { marker: string; sceneId: string } | null {
  const parts = parseAnchorParts(anchorId)
  if (!parts) return null

  const sceneId = `ep${parts.episode}-s${parts.scene}`
  const episode = episodes.find((entry) => entry.number === parts.episode)
  const scene = episode?.scenes[parts.scene - 1]
  if (!scene) return null

  const aktIndex = Math.max(
    1,
    episode.scenes
      .map((s) => s.akt)
      .filter((value, index, list) => list.indexOf(value) === index)
      .indexOf(scene.akt) + 1
  )

  const sceneNumber = parts.scene
  const paragraphNumber = parts.part
  const marker = `#${String(parts.episode).padStart(2, '0')}${String(aktIndex).padStart(2, '0')}${String(sceneNumber).padStart(2, '0')}${String(paragraphNumber).padStart(2, '0')}`
  return { marker, sceneId }
}

function App() {
  // State
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [currentScene, setCurrentScene] = useState(0)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedMotif, setSelectedMotif] = useState<Leitmotif | null>(null)
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryTerm | null>(null)
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS)
  const [showHome, setShowHome] = useState(true)
  const [showGlossary, setShowGlossary] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [glossaryReturnView, setGlossaryReturnView] = useState<GlossaryReturnView>('reading')
  const [activeAnchor, setActiveAnchor] = useState<string>('')
  const [lastSavedAnchor, setLastSavedAnchor] = useState<string>('')
  const [useJumpAnchorInOverview, setUseJumpAnchorInOverview] = useState(false)
  const [previewTerm, setPreviewTerm] = useState<GlossaryTerm | null>(null)

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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as ReaderSettings
      setSettings((prev) => ({ ...prev, ...parsed }))
    } catch {
      // Ignore invalid stored settings
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const savedAnchor = window.localStorage.getItem(LAST_ANCHOR_STORAGE_KEY) || ''
    setLastSavedAnchor(savedAnchor)
  }, [])

  // Computed values
  const currentEpisodeData = episodes[currentEpisode - 1]
  const currentSceneData = currentEpisodeData?.scenes[currentScene]
  const buildMetaLabel = useMemo(() => formatBuildMeta(), [])
  const panelBrightnessLift = Math.max(0, Math.min(100, settings.brightness)) / 100
  const panelBackground = `rgba(9, 10, 14, ${0.52 - panelBrightnessLift * 0.08})`
  const brandMark = (
    <span className="font-mono uppercase tracking-[0.25em] text-zinc-100">
      RING<span className="text-cyan-300">0</span>
    </span>
  )

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

  const glossaryTerms = useMemo(() => buildGlossary(episodes), [episodes])

  const glossaryByTerm = useMemo(() => {
    const map = new Map<string, GlossaryTerm>()
    for (const term of glossaryTerms) {
      map.set(term.term, term)
    }
    return map
  }, [glossaryTerms])

  const activeAnchorLink = useMemo(() => {
    if (!activeAnchor) return ''
    if (typeof window === 'undefined') return `#${activeAnchor}`
    return `${window.location.origin}${window.location.pathname}#${activeAnchor}`
  }, [activeAnchor])
  const lastSavedSceneId = useMemo(() => sceneIdFromAnchor(lastSavedAnchor), [lastSavedAnchor])
  const lastSavedMarker = useMemo(() => {
    if (!lastSavedAnchor) return null
    return toMarkerCode(lastSavedAnchor, episodes)
  }, [lastSavedAnchor, episodes])

  const sceneIndexById = useMemo(() => {
    const map = new Map<string, { episode: number; scene: number }>()
    episodes.forEach((episode) => {
      episode.scenes.forEach((scene, sceneIndex) => {
        map.set(scene.id, { episode: episode.number, scene: sceneIndex })
      })
    })
    return map
  }, [episodes])

  useEffect(() => {
    if (!activeAnchor) return
    window.localStorage.setItem(LAST_ANCHOR_STORAGE_KEY, activeAnchor)
    setLastSavedAnchor(activeAnchor)
  }, [activeAnchor])

  useEffect(() => {
    if (episodes.length === 0) return
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const sceneId = sceneIdFromAnchor(hash)
    if (!sceneId) return
    const target = sceneIndexById.get(sceneId)
    if (!target) return

    setCurrentEpisode(target.episode)
    setCurrentScene(target.scene)
    setShowHome(false)
    setShowGlossary(false)
    setSelectedGlossaryTerm(null)
    setActiveAnchor(hash)

    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: 'start' })
    })
  }, [episodes, sceneIndexById])

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
    setShowGlossary(false)
    setSelectedGlossaryTerm(null)
    setPreviewTerm(null)
    setSettingsOpen(false)
  }, [])

  const openGlossary = useCallback((returnView: GlossaryReturnView) => {
    setGlossaryReturnView(returnView)
    setShowGlossary(true)
    setShowHome(false)
    setSelectedGlossaryTerm(null)
    setPreviewTerm(null)
    setSettingsOpen(false)
  }, [])

  const closeGlossaryToOrigin = useCallback(() => {
    setSelectedGlossaryTerm(null)
    setShowGlossary(false)
    setShowHome(glossaryReturnView === 'home')
    setSettingsOpen(false)
  }, [glossaryReturnView])

  const handleJumpToAnchor = useCallback(
    (anchorId: string) => {
      const sceneId = sceneIdFromAnchor(anchorId)
      if (!sceneId) return
      const target = sceneIndexById.get(sceneId)
      if (!target) return

      setCurrentEpisode(target.episode)
      setCurrentScene(target.scene)
      setShowHome(false)
      setShowGlossary(false)
      setSelectedGlossaryTerm(null)
      setActiveAnchor(anchorId)

      requestAnimationFrame(() => {
        document.getElementById(anchorId)?.scrollIntoView({ block: 'start' })
      })
    },
    [sceneIndexById]
  )

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

  const handleGlossaryTermClick = useCallback(
    (termName: string) => {
      const term = glossaryByTerm.get(termName)
      if (!term) return
      if (term.kind === 'character') {
        handleCharacterClick(termName)
        return
      }
      if (term.kind === 'motif') {
        handleMotifClick(termName)
        return
      }
      setSelectedMotif(null)
      setSelectedCharacter(null)
      openGlossary('reading')
      setSelectedGlossaryTerm(term)
    },
    [glossaryByTerm, handleCharacterClick, handleMotifClick, openGlossary]
  )

  const handleGlossarySelect = useCallback((term: GlossaryTerm) => {
    openGlossary(glossaryReturnView)
    setSelectedGlossaryTerm(term)
  }, [glossaryReturnView, openGlossary])

  const handleJumpToAppearance = useCallback(
    (sceneId: string) => {
      const target = sceneIndexById.get(sceneId)
      if (!target) return
      setCurrentEpisode(target.episode)
      setCurrentScene(target.scene)
      setShowGlossary(false)
      setSelectedGlossaryTerm(null)
      setShowHome(false)
      setPreviewTerm(null)
    },
    [sceneIndexById]
  )

  const handleTermPreviewStart = useCallback(
    (termName: string) => {
      const term = glossaryByTerm.get(termName)
      if (!term) return
      setPreviewTerm(term)
    },
    [glossaryByTerm]
  )

  const handleTermPreviewEnd = useCallback((termName: string) => {
    setPreviewTerm((current) => {
      if (!current) return null
      if (current.term === termName) return null
      return current
    })
  }, [])

  const handleTermPreviewToggle = useCallback(
    (termName: string) => {
      const term = glossaryByTerm.get(termName)
      if (!term) return
      setPreviewTerm((current) => (current?.term === term.term ? null : term))
    },
    [glossaryByTerm]
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

  if (selectedGlossaryTerm) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <AnimatedBackground theme={settings.theme} brightness={settings.brightness} />
        <TextureOverlay theme={settings.theme} brightness={settings.brightness} />
        <div className="relative z-10">
          <header className="max-w-4xl mx-auto px-8 py-6 border-b border-zinc-800/50 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setSelectedGlossaryTerm(null)
                openGlossary(glossaryReturnView)
              }}
              className="text-zinc-400 hover:text-orange-300 transition-colors"
            >
              {brandMark}
            </button>
            <button
              type="button"
              onClick={closeGlossaryToOrigin}
              className="text-zinc-500 hover:text-zinc-200 transition-colors text-sm"
            >
              {glossaryReturnView === 'home' ? 'Zur Uebersicht' : 'Zur Leseansicht'}
            </button>
          </header>
          <GlossaryDetail
            term={selectedGlossaryTerm}
            onBack={() => setSelectedGlossaryTerm(null)}
            onJumpToAppearance={handleJumpToAppearance}
          />
          <footer className="max-w-4xl mx-auto px-8 pb-8 text-xs font-mono text-zinc-600">
            {buildMetaLabel}
          </footer>
        </div>
      </div>
    )
  }

  if (showGlossary) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <AnimatedBackground theme={settings.theme} brightness={settings.brightness} />
        <TextureOverlay theme={settings.theme} brightness={settings.brightness} />
        <div className="relative z-10">
          <header className="max-w-5xl mx-auto px-8 py-6 border-b border-zinc-800/50 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={closeGlossaryToOrigin}
              className="text-zinc-400 hover:text-orange-300 transition-colors"
            >
              {glossaryReturnView === 'home' ? 'Zur Uebersicht' : 'Zur Leseansicht'}
            </button>
            <button
              type="button"
              onClick={() => setShowHome(true)}
              className="text-zinc-500 hover:text-zinc-200 transition-colors text-sm"
            >
              Episodenstart
            </button>
          </header>
          <GlossaryPanel terms={glossaryTerms} onTermSelect={handleGlossarySelect} />
          <footer className="max-w-5xl mx-auto px-8 pb-8 text-xs font-mono text-zinc-600">
            {buildMetaLabel}
          </footer>
        </div>
      </div>
    )
  }

  // Home view
  if (showHome || !currentEpisodeData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <AnimatedBackground theme={settings.theme} brightness={settings.brightness} />
        <TextureOverlay theme={settings.theme} brightness={settings.brightness} />

        <div className="relative z-10 max-w-4xl mx-auto px-8 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-orange-400 tracking-wider uppercase mb-4">
              {brandMark}
            </h1>
            <p className="text-xl text-zinc-500 font-light">scifi-noir ring cycle reader</p>
            <button
              type="button"
              onClick={() => openGlossary('home')}
              className="mt-4 text-sm text-zinc-400 hover:text-orange-300 transition-colors"
            >
              Glossar oeffnen
            </button>
            {lastSavedAnchor && (
              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleJumpToAnchor(lastSavedAnchor)}
                  className="text-xs uppercase tracking-wider text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Vorspringen zur letzten Stelle
                </button>
                <label className="text-xs text-zinc-500 inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useJumpAnchorInOverview}
                    onChange={(event) => setUseJumpAnchorInOverview(event.target.checked)}
                    className="accent-cyan-500"
                  />
                  Beim Szenenklick zuletzt gespeicherten Absatz bevorzugen
                </label>
              </div>
            )}
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
                    type="button"
                    key={scene.id}
                    onClick={() => {
                      if (
                        useJumpAnchorInOverview &&
                        lastSavedAnchor &&
                        lastSavedSceneId === scene.id
                      ) {
                        handleJumpToAnchor(lastSavedAnchor)
                        return
                      }
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
        <footer className="relative z-10 max-w-4xl mx-auto px-8 pb-8 text-xs font-mono text-zinc-600">
          {buildMetaLabel}
        </footer>
      </div>
    )
  }

  // Reading view
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-200">
      <AnimatedBackground theme={settings.theme} brightness={settings.brightness} />
      <TextureOverlay theme={settings.theme} brightness={settings.brightness} />

      {/* Header */}
      <header
        className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 backdrop-blur-sm"
        style={{ backgroundColor: panelBackground }}
      >
        <button
          type="button"
          onClick={() => setShowHome(true)}
          className="text-zinc-600 hover:text-orange-400 transition-colors"
        >
          <h1 className="text-lg font-bold">
            EP{currentEpisode} —{' '}
            {currentEpisodeData?.title.split('—')[1]?.trim() || currentEpisodeData?.title}
          </h1>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px]">{brandMark}</span>
          <div className="hidden md:block">
            <ProgressTracker
            episodes={episodes}
            currentEpisode={currentEpisode}
            currentScene={currentScene}
            totalScenesRead={totalScenesRead}
            totalScenes={totalScenes}
            onEpisodeClick={handleEpisodeClick}
            />
          </div>
        </div>
      </header>

      <aside
        className={`hidden md:block fixed right-4 top-20 z-30 w-80 rounded border border-zinc-700/70 backdrop-blur px-4 py-3 transition-all duration-300 pointer-events-none ${
          previewTerm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        }`}
        style={{ backgroundColor: `rgba(24, 24, 27, ${0.85 - panelBrightnessLift * 0.18})` }}
      >
        {previewTerm && (
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">{previewTerm.kind}</p>
            <p className="font-mono text-zinc-100 mt-1">{previewTerm.term}</p>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{previewTerm.shortDescription}</p>
          </div>
        )}
      </aside>

      <aside
        className={`md:hidden fixed left-3 right-3 bottom-20 z-30 rounded border border-zinc-700/70 backdrop-blur px-4 py-3 transition-all duration-300 ${
          previewTerm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
        style={{ backgroundColor: `rgba(24, 24, 27, ${0.88 - panelBrightnessLift * 0.14})` }}
      >
        {previewTerm && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">{previewTerm.kind}</p>
              <p className="font-mono text-zinc-100 mt-1 truncate">{previewTerm.term}</p>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed max-h-16 overflow-hidden">
                {previewTerm.shortDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewTerm(null)}
              className="text-xs text-zinc-500 hover:text-zinc-200"
            >
              Schliessen
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <SceneViewer
          scene={currentSceneData || null}
          characters={sceneCharacters}
          onCharacterClick={handleCharacterClick}
          onMotifClick={handleMotifClick}
          onGlossaryTermClick={handleGlossaryTermClick}
          onTermPreviewStart={handleTermPreviewStart}
          onTermPreviewEnd={handleTermPreviewEnd}
          onTermPreviewToggle={handleTermPreviewToggle}
          onActiveAnchorChange={setActiveAnchor}
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
          isHomeActive={showHome}
          isGlossaryActive={showGlossary || selectedGlossaryTerm !== null}
          onGlossary={() => openGlossary('reading')}
          onBack={handlePrevEpisode}
          onForward={handleNextEpisode}
          onPrevScene={handlePrevScene}
          onNextScene={handleNextScene}
          onHome={() => {
            setShowHome(true)
            setShowGlossary(false)
            setSelectedGlossaryTerm(null)
            setSettingsOpen(false)
          }}
          renderSettingsControl={(className) => (
            <ReaderSettingsDialog
              settings={settings}
              onSettingsChange={setSettings}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              triggerClassName={settingsOpen ? 'text-zinc-100 bg-zinc-800/70 hover:bg-zinc-700/70' : className}
            />
          )}
          jumpMarker={lastSavedMarker?.marker}
          onJumpToMarker={lastSavedAnchor ? () => handleJumpToAnchor(lastSavedAnchor) : undefined}
          progressRatio={totalScenes > 0 ? totalScenesRead / totalScenes : 0}
          episodeCuts={episodes.length > 1 ? Array.from({ length: episodes.length - 1 }, (_, index) => (index + 1) / episodes.length) : []}
        />
        <div className="px-4 pb-1 text-[11px] font-mono text-zinc-600 text-center">{buildMetaLabel}</div>
        {activeAnchor && (
          <div className="px-4 pb-3 text-[13px] font-mono text-zinc-400 text-center">
            Abschnitt: {activeAnchor}
            {activeAnchorLink && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(activeAnchorLink)
                  } catch {
                    // Clipboard access can fail silently in some browsers.
                  }
                }}
                className="ml-2 text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                Link kopieren
              </button>
            )}
          </div>
        )}
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
