import type { GlossaryTerm } from '@/types'
import { Button } from '@/components/ui/button'

interface GlossaryDetailProps {
  term: GlossaryTerm
  onBack: () => void
  onJumpToAppearance: (sceneId: string) => void
}

export function GlossaryDetail({ term, onBack, onJumpToAppearance }: GlossaryDetailProps) {
  const paragraphs = (term.longDescription || '').split('\n\n').map((part) => part.trim()).filter(Boolean)

  return (
    <section className="max-w-4xl mx-auto px-8 py-12 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="border-zinc-700 bg-zinc-900/60">
          Zurueck zum Glossar
        </Button>
        <span className="text-xs uppercase tracking-widest text-zinc-500">{term.kind}</span>
      </div>

      <div>
        <h2 className="text-4xl font-semibold text-zinc-100 font-mono">{term.term}</h2>
        <p className="text-zinc-300 mt-3 leading-relaxed">{term.shortDescription}</p>
      </div>

      {paragraphs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-widest text-zinc-500">Erweiterte Beschreibung</h3>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-zinc-300 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-3">Auftreten im Text</h3>
        {term.appearances.length === 0 ? (
          <p className="text-zinc-500">Noch keine Fundstellen erkannt.</p>
        ) : (
          <div className="space-y-2">
            {term.appearances.map((appearance) => (
              <button
                type="button"
                key={`${appearance.sceneId}-${appearance.count}`}
                onClick={() => onJumpToAppearance(appearance.sceneId)}
                className="w-full text-left p-3 rounded border border-zinc-800 bg-zinc-900/50 hover:border-orange-500/40 hover:bg-zinc-900/90 transition-colors"
              >
                <p className="text-zinc-200 font-medium">
                  EP{appearance.episode} · {appearance.akt}
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {appearance.sceneTitle} · Nennungen: {appearance.count}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
