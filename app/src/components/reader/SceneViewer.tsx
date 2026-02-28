import { type Scene, type ContentBlock } from '@/types'
import { DialogueBlock } from './DialogueBlock'
import { NarrativeBlock } from './NarrativeBlock'
import { SceneHeader as SceneHeaderComponent } from './SceneHeader'
import { useEffect, useRef } from 'react'

interface SceneViewerProps {
  scene: Scene | null
  characters: Map<string, { name: string; description: string }>
  onCharacterClick?: (name: string) => void
  onMotifClick?: (motif: string) => void
  onGlossaryTermClick?: (term: string) => void
  onTermPreviewStart?: (name: string) => void
  onTermPreviewEnd?: (name: string) => void
  onTermPreviewToggle?: (name: string) => void
  onActiveAnchorChange?: (anchorId: string) => void
  autoScroll?: boolean
  fontSize?: 'sm' | 'md' | 'lg' | 'xl'
  lineHeight?: 'tight' | 'normal' | 'relaxed'
  fontFamily?: 'sans' | 'serif' | 'mono'
}

const FONT_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

const LINE_HEIGHTS = {
  tight: 'leading-tight',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
}

const FONT_FAMILIES = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
}

export function SceneViewer({
  scene,
  characters,
  onCharacterClick,
  onMotifClick,
  onGlossaryTermClick,
  onTermPreviewStart,
  onTermPreviewEnd,
  onTermPreviewToggle,
  onActiveAnchorChange,
  autoScroll = false,
  fontSize = 'md',
  lineHeight = 'normal',
  fontFamily = 'sans',
}: SceneViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [scene?.id, autoScroll])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !scene || !onActiveAnchorChange) return

    const anchors = Array.from(container.querySelectorAll<HTMLElement>('[data-anchor-id]'))
    if (anchors.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        const anchorId = top?.target.getAttribute('data-anchor-id')
        if (anchorId) {
          onActiveAnchorChange(anchorId)
        }
      },
      {
        root: container,
        threshold: [0.4, 0.7, 1],
      }
    )

    for (const anchor of anchors) {
      observer.observe(anchor)
    }

    return () => observer.disconnect()
  }, [scene, onActiveAnchorChange])

  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-2 border-zinc-800 rounded-full animate-pulse" />
          <p className="text-zinc-700 font-mono text-sm">Loading scene...</p>
        </div>
      </div>
    )
  }

  const renderBlock = (block: ContentBlock, index: number) => {
    const blockAnchorPrefix = `${scene.id}-b${index + 1}`

    switch (block.type) {
      case 'dialogue':
        return (
          <DialogueBlock
            key={`dialogue-${index}`}
            block={block}
            characters={characters}
            blockAnchorPrefix={blockAnchorPrefix}
            onCharacterClick={onCharacterClick}
            onMotifClick={onMotifClick}
            onGlossaryTermClick={onGlossaryTermClick}
            onTermPreviewStart={onTermPreviewStart}
            onTermPreviewEnd={onTermPreviewEnd}
            onTermPreviewToggle={onTermPreviewToggle}
          />
        )
      case 'narrative':
        return (
          <NarrativeBlock
            key={`narrative-${index}`}
            block={block}
            blockAnchorPrefix={blockAnchorPrefix}
            characters={characters}
            onCharacterClick={onCharacterClick}
            onMotifClick={onMotifClick}
            onGlossaryTermClick={onGlossaryTermClick}
            onTermPreviewStart={onTermPreviewStart}
            onTermPreviewEnd={onTermPreviewEnd}
            onTermPreviewToggle={onTermPreviewToggle}
          />
        )
      case 'scene':
        return <SceneHeaderComponent key={`scene-${index}`} block={block} />
      default:
        return null
    }
  }

  return (
    <div
      ref={containerRef}
      className={`
        h-full overflow-y-auto scroll-smooth
        ${FONT_SIZES[fontSize]} ${LINE_HEIGHTS[lineHeight]} ${FONT_FAMILIES[fontFamily]}
      `}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(39 39 42) transparent',
      }}
    >
      <div className="max-w-2xl mx-auto px-8 py-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
        {scene.blocks.map((block, index) => renderBlock(block, index))}

        {/* Scene end indicator */}
        <div className="mt-16 pt-8 border-t border-zinc-800/50 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-zinc-800 w-16" />
            <span className="text-xs font-mono text-zinc-700">END OF SCENE</span>
            <div className="h-px bg-zinc-800 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
