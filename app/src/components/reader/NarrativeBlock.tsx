import type { NarrativeBlock } from '@/types'
import { findMotifReferences } from '@/lib/org-parser'

interface NarrativeBlockProps {
  block: NarrativeBlock
  blockAnchorPrefix?: string
  characters?: Map<string, { name: string; description: string }>
  onCharacterClick?: (character: string) => void
  onMotifClick?: (motif: string) => void
  onGlossaryTermClick?: (term: string) => void
  onTermPreviewStart?: (name: string) => void
  onTermPreviewEnd?: (name: string) => void
  onTermPreviewToggle?: (name: string) => void
}

export function NarrativeBlock({
  block,
  blockAnchorPrefix,
  characters,
  onCharacterClick,
  onMotifClick,
  onGlossaryTermClick,
  onTermPreviewStart,
  onTermPreviewEnd,
  onTermPreviewToggle,
}: NarrativeBlockProps) {
  const motifs = findMotifReferences(block.text)

  // Render text with motif highlighting
  const renderText = (text: string) => {
    const regex = /=([A-ZÄÖÜß_]+)=/g
    const parts: Array<{ text: string; isMotif: boolean; motif?: string }> = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, match.index), isMotif: false })
      }
      // Add motif
      parts.push({ text: match[1], isMotif: true, motif: match[1] })
      lastIndex = regex.lastIndex
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isMotif: false })
    }

    return parts.map((part, i) => {
      if (part.isMotif && part.motif) {
        const isCharacter = characters?.has(part.motif)

        if (isCharacter) {
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => onTermPreviewStart?.(part.motif!)}
              onMouseLeave={() => onTermPreviewEnd?.(part.motif!)}
              onTouchStart={() => onTermPreviewToggle?.(part.motif!)}
              onClick={() => onCharacterClick?.(part.motif!)}
              className="mx-0.5 px-1.5 py-0.5 text-orange-300/90 font-mono text-sm
                     bg-orange-500/10 border border-orange-500/20 rounded-sm
                     hover:bg-orange-500/20 hover:border-orange-500/40
                     transition-all duration-200"
            >
              ={part.text}=
            </button>
          )
        }

        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => onTermPreviewStart?.(part.motif!)}
            onMouseLeave={() => onTermPreviewEnd?.(part.motif!)}
            onTouchStart={() => onTermPreviewToggle?.(part.motif!)}
            onClick={() => {
              if (motifs.includes(part.motif!)) {
                onMotifClick?.(part.motif!)
              }
              onGlossaryTermClick?.(part.motif!)
            }}
            className="mx-0.5 px-1.5 py-0.5 text-green-400/90 font-mono text-sm
                     bg-green-500/10 border border-green-500/20 rounded-sm
                     hover:bg-green-500/20 hover:border-green-500/40
                     transition-all duration-200"
          >
            ={part.text}=
          </button>
        )
      }
      return <span key={i}>{part.text}</span>
    })
  }

  // Split into paragraphs
  const paragraphs = block.text.split('\n\n')

  return (
    <div className="my-6 first:mt-4">
      {paragraphs.map((para, i) => (
        <p
          key={i}
          id={blockAnchorPrefix ? `${blockAnchorPrefix}-p${i + 1}` : undefined}
          data-anchor-id={blockAnchorPrefix ? `${blockAnchorPrefix}-p${i + 1}` : undefined}
          className="text-zinc-400 leading-relaxed font-light indent-8 first:indent-0 scroll-mt-24"
        >
          {renderText(para)}
        </p>
      ))}
    </div>
  )
}
