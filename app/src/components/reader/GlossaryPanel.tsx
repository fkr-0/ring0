import { useMemo, useState } from 'react'
import type { GlossaryTerm } from '@/types'
import { Input } from '@/components/ui/input'

interface GlossaryPanelProps {
  terms: GlossaryTerm[]
  onTermSelect: (term: GlossaryTerm) => void
}

function buildInitial(term: string): string {
  const first = term.charAt(0).toUpperCase()
  return /[A-ZÄÖÜ]/.test(first) ? first : '#'
}

export function GlossaryPanel({ terms, onTermSelect }: GlossaryPanelProps) {
  const [query, setQuery] = useState('')

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return terms
    return terms.filter((term) => {
      return (
        term.term.toLowerCase().includes(q) ||
        term.shortDescription.toLowerCase().includes(q) ||
        term.kind.toLowerCase().includes(q)
      )
    })
  }, [terms, query])

  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>()
    for (const term of filteredTerms) {
      const initial = buildInitial(term.term)
      const list = map.get(initial) || []
      list.push(term)
      map.set(initial, list)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'de'))
  }, [filteredTerms])

  return (
    <section className="max-w-5xl mx-auto px-8 py-12">
      <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-zinc-100 tracking-tight">Glossar</h2>
          <p className="text-zinc-400 mt-2">
            Alphabetische Begriffe mit Kurzbeschreibung und Auftrittsstellen.
          </p>
        </div>
        <div className="w-full max-w-md">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Begriff oder Beschreibung durchsuchen..."
            className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="space-y-8">
        {grouped.map(([initial, items]) => (
          <div key={initial}>
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-3">{initial}</h3>
            <div className="grid gap-2">
              {items.map((term) => (
                <button
                  type="button"
                  key={term.slug}
                  onClick={() => onTermSelect(term)}
                  className="text-left p-3 rounded border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-zinc-100">{term.term}</p>
                      <p className="text-sm text-zinc-400 mt-1">{term.shortDescription}</p>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-zinc-500">{term.kind}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
