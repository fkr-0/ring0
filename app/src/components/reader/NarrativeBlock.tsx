import type { NarrativeBlock } from '@/types'
import { findMotifReferences } from '@/lib/org-parser'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface NarrativeBlockProps {
  block: NarrativeBlock
  characters?: Map<string, { name: string; description: string }>
  onCharacterClick?: (character: string) => void
  onMotifClick?: (motif: string) => void
  onGlossaryTermClick?: (term: string) => void
}

export function NarrativeBlock({
  block,
  characters,
  onCharacterClick,
  onMotifClick,
  onGlossaryTermClick,
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
        const characterDescription = isCharacter ? characters?.get(part.motif)?.description : ''

        if (isCharacter) {
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onCharacterClick?.(part.motif!)}
                  className="mx-0.5 px-1.5 py-0.5 text-orange-300/90 font-mono text-sm
                     bg-orange-500/10 border border-orange-500/20 rounded-sm
                     hover:bg-orange-500/20 hover:border-orange-500/40
                     transition-all duration-200"
                >
                  ={part.text}=
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-mono text-[11px] uppercase tracking-wide text-zinc-300">
                  {part.motif}
                </p>
                <p className="mt-1 text-xs text-zinc-100 leading-relaxed">
                  {characterDescription || 'Keine Beschreibung vorhanden.'}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        }

        return (
          <button
            key={i}
            type="button"
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
        <p key={i} className="text-zinc-400 leading-relaxed font-light indent-8 first:indent-0">
          {renderText(para)}
        </p>
      ))}
    </div>
  )
}
