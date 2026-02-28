import { type DialogueLine } from '@/types'
import { Badge } from '@/components/ui/badge'

interface DialogueBlockProps {
  block: DialogueLine
  characters: Map<string, { name: string; description: string }>
  onCharacterClick?: (name: string) => void
}

const MOTIF_COLORS = {
  fire: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
  gold: 'text-amber-100 border-amber-100/30 bg-amber-100/10',
  rhein: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  neon: 'text-cyan-300 border-cyan-300/30 bg-cyan-300/10',
  radioactive: 'text-green-400 border-green-400/30 bg-green-400/10',
  blood: 'text-red-500 border-red-500/30 bg-red-500/10',
}

export function DialogueBlock({ block, characters, onCharacterClick }: DialogueBlockProps) {
  const character = characters.get(block.character)

  // Find motif references in dialogue
  const motifMatches = block.lines.flatMap((line) => {
    const matches = line.matchAll(/=([A-ZÄÖÜß_]+)=/g)
    return Array.from(matches).map((m) => m[1])
  })

  // Render line with motif highlighting
  const renderLine = (line: string) => {
    const parts = line.split(/([A-ZÄÖÜß_]+)/g).filter(Boolean)
    return parts.map((part, i) => {
      if (part.match(/^[A-ZÄÖÜß_]+$/) && part !== block.character) {
        // This might be a motif reference
        return (
          <span key={i} className="text-green-400/80 font-mono">
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="my-8 first:mt-4">
      {/* Character header with glow */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => onCharacterClick?.(block.character)} className="relative group">
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
          <p key={i} className="text-zinc-300 leading-relaxed font-light">
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
