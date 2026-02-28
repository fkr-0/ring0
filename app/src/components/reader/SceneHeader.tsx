import { type SceneHeader as SceneHeaderType } from '@/types'

interface SceneHeaderProps {
  block: SceneHeaderType
}

export function SceneHeader({ block }: SceneHeaderProps) {
  return (
    <div className="my-12 pt-8 border-t border-zinc-800/50">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs font-mono text-orange-500/60">{block.akt}</span>
      </div>
      <h2 className="text-2xl font-light text-zinc-300 tracking-wide">{block.scene}</h2>
      {block.location && <p className="text-sm text-zinc-600 mt-1 font-mono">{block.location}</p>}
    </div>
  )
}
