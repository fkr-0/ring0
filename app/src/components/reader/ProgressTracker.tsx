import { Episode } from '@/types'
import { Badge } from '@/components/ui/badge'

interface ProgressTrackerProps {
  episodes: Episode[]
  currentEpisode: number
  currentScene: number
  totalScenesRead: number
  totalScenes: number
  onEpisodeClick?: (episode: number) => void
}

export function ProgressTracker({
  episodes,
  currentEpisode,
  currentScene,
  totalScenesRead,
  totalScenes,
  onEpisodeClick,
}: ProgressTrackerProps) {
  const globalProgress = totalScenes > 0 ? (totalScenesRead / totalScenes) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Global progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
            Story Progress
          </span>
          <span className="text-xs font-mono text-zinc-500">
            {totalScenesRead} / {totalScenes} scenes
          </span>
        </div>
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400
                     transition-all duration-500 ease-out"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
      </div>

      {/* Episode progress */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">Episodes</span>
        <div className="flex flex-wrap gap-2">
          {episodes.map((ep, idx) => {
            const isActive = idx + 1 === currentEpisode
            const isCompleted = idx + 1 < currentEpisode
            const epProgress = isActive
              ? ((currentScene + 1) / ep.scenes.length) * 100
              : isCompleted
                ? 100
                : 0

            return (
              <button
                key={ep.number}
                onClick={() => onEpisodeClick?.(ep.number)}
                className={`relative group overflow-hidden rounded-sm border transition-all ${
                  isActive
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : isCompleted
                      ? 'border-zinc-700 bg-zinc-900/50'
                      : 'border-zinc-800 bg-zinc-950/50'
                }`}
              >
                {/* Progress fill */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ${
                    isActive
                      ? 'bg-orange-500/20'
                      : isCompleted
                        ? 'bg-zinc-700/30'
                        : 'bg-transparent'
                  }`}
                  style={{ width: `${epProgress}%` }}
                />

                <div className="relative px-3 py-2">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={`text-xs font-mono ${
                        isActive
                          ? 'text-orange-400'
                          : isCompleted
                            ? 'text-zinc-400'
                            : 'text-zinc-600'
                      }`}
                    >
                      EP{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-light truncate max-w-[80px] ${
                        isActive ? 'text-zinc-300' : isCompleted ? 'text-zinc-500' : 'text-zinc-700'
                      }`}
                    >
                      {ep.title.split('—')[1]?.trim() || ep.title}
                    </span>
                  </div>
                </div>

                {/* Glow effect for active */}
                {isActive && (
                  <div className="absolute -inset-1 bg-orange-500/20 blur-sm rounded-sm opacity-50" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scene progress within current episode */}
      {episodes[currentEpisode - 1] && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
              Current Episode
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {currentScene + 1} / {episodes[currentEpisode - 1].scenes.length} scenes
            </span>
          </div>
          <div className="flex gap-1">
            {episodes[currentEpisode - 1].scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className={`h-1 flex-1 rounded-full transition-all ${
                  idx < currentScene
                    ? 'bg-orange-500/60'
                    : idx === currentScene
                      ? 'bg-orange-400'
                      : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
