import { type Leitmotif, type Character } from '@/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { X } from 'lucide-react'

interface MotifSheetProps {
  motif: Leitmotif | null
  relatedCharacters: Character[]
  open: boolean
  onClose: () => void
}

const MOTIF_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  fire: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
  },
  gold: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
  rhein: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/20',
  },
  neon: {
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-300',
    border: 'border-cyan-400/30',
    glow: 'shadow-cyan-400/20',
  },
  radioactive: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20',
  },
  blood: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
  },
}

export function MotifSheet({ motif, relatedCharacters, open, onClose }: MotifSheetProps) {
  if (!motif) return null

  const colors = MOTIF_COLORS[motif.color || 'gold'] || MOTIF_COLORS.gold

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[100vw] max-w-[100vw] sm:w-[500px] sm:max-w-[500px] bg-zinc-950/95 border-zinc-800 p-0 overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <SheetHeader className="mb-4 px-4 pt-8 sm:px-6">
          {/* Glowing motif name */}
          <div
            className={`relative inline-block mb-4 p-6 rounded-sm border ${colors.border} ${colors.bg}`}
          >
            <div className={`absolute inset-0 rounded-sm blur-xl ${colors.glow} opacity-50`} />
            <SheetTitle className={`relative text-3xl font-bold font-mono ${colors.text}`}>
              ={motif.name}=
            </SheetTitle>
          </div>
          <SheetDescription className="text-zinc-500">Leitmotif</SheetDescription>
        </SheetHeader>

        <div className="h-[calc(100dvh-190px)] overflow-y-auto px-4 pb-8 sm:px-6">
          <div className="space-y-6 pr-1">
            {/* Description */}
            <div>
              <h4 className="text-xs font-mono text-zinc-600 uppercase tracking-wider mb-3">
                Meaning
              </h4>
              <p className="text-zinc-400 leading-relaxed font-light text-lg">
                {motif.description}
              </p>
            </div>

            {/* Related characters */}
            {relatedCharacters.length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-zinc-600 uppercase tracking-wider mb-3">
                  Associated Characters
                </h4>
                <div className="space-y-2">
                  {relatedCharacters.map((char) => (
                    <div
                      key={char.name}
                      className="p-3 rounded-sm border border-zinc-800 bg-zinc-900/30
                               hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
                    >
                      <span className="text-orange-400 font-bold">{char.name}</span>
                      <p className="text-sm text-zinc-500 mt-1 font-light">{char.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
