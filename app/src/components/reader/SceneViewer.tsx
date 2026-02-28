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
    switch (block.type) {
      case 'dialogue':
        return (
          <DialogueBlock
            key={`dialogue-${index}`}
            block={block}
            characters={characters}
            onCharacterClick={onCharacterClick}
            onMotifClick={onMotifClick}
            onGlossaryTermClick={onGlossaryTermClick}
          />
        )
      case 'narrative':
        return (
          <NarrativeBlock
            key={`narrative-${index}`}
            block={block}
            characters={characters}
            onCharacterClick={onCharacterClick}
            onMotifClick={onMotifClick}
            onGlossaryTermClick={onGlossaryTermClick}
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
