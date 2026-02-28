import { type Character, type Leitmotif } from '@/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CharacterSheetProps {
  character: Character | null
  relatedMotifs: Leitmotif[]
  open: boolean
  onClose: () => void
}

const MOTIF_COLORS: Record<string, string> = {
  fire: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  gold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  rhein: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  neon: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
  radioactive: 'bg-green-500/20 text-green-400 border-green-500/30',
  blood: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function CharacterSheet({ character, relatedMotifs, open, onClose }: CharacterSheetProps) {
  if (!character) return null

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
          {/* Glowing character name */}
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 bg-orange-500/10 rounded-sm blur-xl" />
            <SheetTitle className="relative text-3xl font-bold text-orange-400 tracking-wider uppercase">
              {character.name}
            </SheetTitle>
          </div>
          <SheetDescription className="text-zinc-500">
            Character across {character.episodes.length} episode
            {character.episodes.length > 1 ? 's' : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="h-[calc(100dvh-190px)] overflow-y-auto px-4 pb-8 sm:px-6">
          <div className="space-y-6 pr-1">
            {/* Episode appearances */}
            <div>
              <h4 className="text-xs font-mono text-zinc-600 uppercase tracking-wider mb-3">
                Appears In
              </h4>
              <div className="flex flex-wrap gap-2">
                {character.episodes.map((ep) => (
                  <Badge
                    key={ep}
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 bg-zinc-900/50"
                  >
                    Episode {ep}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-mono text-zinc-600 uppercase tracking-wider mb-3">
                About
              </h4>
              <p className="text-zinc-400 leading-relaxed font-light">{character.description}</p>
            </div>

            {/* Related motifs */}
            {relatedMotifs.length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-zinc-600 uppercase tracking-wider mb-3">
                  Associated Leitmotifs
                </h4>
                <div className="space-y-2">
                  {relatedMotifs.map((motif) => (
                    <div
                      key={motif.name}
                      className={`p-3 rounded-sm border ${
                        MOTIF_COLORS[motif.color || 'gold'] || MOTIF_COLORS.gold
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold">={motif.name}=</span>
                      </div>
                      <p className="text-sm opacity-80 font-light">{motif.description}</p>
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
