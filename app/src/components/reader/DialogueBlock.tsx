import type { DialogueLine } from '@/types'
import { Badge } from '@/components/ui/badge'

interface DialogueBlockProps {
  block: DialogueLine
  characters: Map<string, { name: string; description: string }>
  blockAnchorPrefix?: string
  onCharacterClick?: (name: string) => void
  onMotifClick?: (name: string) => void
  onGlossaryTermClick?: (name: string) => void
  onTermPreviewStart?: (name: string) => void
  onTermPreviewEnd?: (name: string) => void
  onTermPreviewToggle?: (name: string) => void
}

const MOTIF_COLORS = {
  fire: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
  gold: 'text-amber-100 border-amber-100/30 bg-amber-100/10',
  rhein: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  neon: 'text-cyan-300 border-cyan-300/30 bg-cyan-300/10',
  radioactive: 'text-green-400 border-green-400/30 bg-green-400/10',
  blood: 'text-red-500 border-red-500/30 bg-red-500/10',
}

export function DialogueBlock({
  block,
  characters,
  blockAnchorPrefix,
  onCharacterClick,
  onMotifClick,
  onGlossaryTermClick,
  onTermPreviewStart,
  onTermPreviewEnd,
  onTermPreviewToggle,
}: DialogueBlockProps) {
  // Find motif references in dialogue
  const motifMatches = block.lines.flatMap((line) => {
    const matches = line.matchAll(/=([A-ZÄÖÜß_]+)=/g)
    return Array.from(matches).map((m) => m[1])
  })

  // Render line with motif highlighting
  const renderLine = (line: string) => {
    const parts = line.split(/(=[A-ZÄÖÜß_]+=)/g).filter(Boolean)
    return parts.map((part, i) => {
      const match = part.match(/^=([A-ZÄÖÜß_]+)=$/)
      if (match) {
        const ref = match[1]
        const isCharacter = characters.has(ref)
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => onTermPreviewStart?.(ref)}
            onMouseLeave={() => onTermPreviewEnd?.(ref)}
            onTouchStart={() => onTermPreviewToggle?.(ref)}
            onClick={() => {
              if (isCharacter) {
                onCharacterClick?.(ref)
                return
              }
              onMotifClick?.(ref)
              onGlossaryTermClick?.(ref)
            }}
            className="mx-0.5 px-1.5 py-0.5 text-green-400/90 font-mono text-sm
                     bg-green-500/10 border border-green-500/20 rounded-sm
                     hover:bg-green-500/20 hover:border-green-500/40
                     transition-all duration-200"
          >
            ={ref}=
          </button>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="my-8 first:mt-4">
      {/* Character header with glow */}
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onMouseEnter={() => onTermPreviewStart?.(block.character)}
          onMouseLeave={() => onTermPreviewEnd?.(block.character)}
          onTouchStart={() => onTermPreviewToggle?.(block.character)}
          onClick={() => onCharacterClick?.(block.character)}
          className="relative group"
        >
          <div className="absolute -inset-2 bg-orange-500/20 rounded-sm blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="relative font-bold text-orange-400 text-sm tracking-wider uppercase">
            {block.character}
          </h3>
        </button>
        {block.stageDirection && (
          <span className="text-xs text-zinc-600 italic font-light">({block.stageDirection})</span>
        )}
      </div>

      {/* Dialogue lines */}
      <div className="pl-4 space-y-1">
        {block.lines.map((line, i) => (
          <p
            key={i}
            id={blockAnchorPrefix ? `${blockAnchorPrefix}-l${i + 1}` : undefined}
            data-anchor-id={blockAnchorPrefix ? `${blockAnchorPrefix}-l${i + 1}` : undefined}
            className="text-zinc-300 leading-relaxed font-light scroll-mt-24"
          >
            {renderLine(line)}
          </p>
        ))}
      </div>

      {/* Motif tags */}
      {motifMatches.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {motifMatches.map((motif, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-xs font-mono border-green-500/30 text-green-400/80 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-default"
            >
              ={motif}=
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
