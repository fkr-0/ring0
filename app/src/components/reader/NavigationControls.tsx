import { Button } from '@/components/ui/button'
import { BookOpen, ChevronLeft, ChevronRight, Home, Menu, TabletSmartphone } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface NavigationControlsProps {
  canGoBack: boolean
  canGoForward: boolean
  canGoToPrevScene: boolean
  canGoToNextScene: boolean
  isHomeActive?: boolean
  isGlossaryActive?: boolean
  onGlossary: () => void
  onBack: () => void
  onForward: () => void
  onPrevScene: () => void
  onNextScene: () => void
  onHome: () => void
  renderSettingsControl: (className: string) => ReactNode
  jumpMarker?: string
  onJumpToMarker?: () => void
  progressRatio: number
  episodeCuts?: number[]
}

export function NavigationControls({
  canGoBack,
  canGoForward,
  canGoToPrevScene,
  canGoToNextScene,
  isHomeActive = false,
  isGlossaryActive = false,
  onGlossary,
  onBack,
  onForward,
  onPrevScene,
  onNextScene,
  onHome,
  renderSettingsControl,
  jumpMarker,
  onJumpToMarker,
  progressRatio,
  episodeCuts = [0.25, 0.5, 0.75],
}: NavigationControlsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const clampedProgress = Math.max(0, Math.min(1, progressRatio))

  return (
    <div className="relative border-t border-zinc-800/50 bg-zinc-950/60">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500/20 via-cyan-500/15 to-orange-400/20"
          style={{ width: `${clampedProgress * 100}%` }}
        />
        {episodeCuts.map((cut, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 w-px bg-zinc-700/50"
            style={{ left: `${cut * 100}%` }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-between px-3 py-2">
        {/* Left navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            disabled={!canGoBack}
            className="hidden sm:inline-flex text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-30"
            title="Previous episode (Shift+←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevScene}
            disabled={!canGoToPrevScene}
            className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60 disabled:opacity-30"
            title="Previous scene (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Center menu */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onGlossary}
            className={
              isGlossaryActive
                ? 'text-zinc-100 bg-zinc-800/70 hover:bg-zinc-700/70'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
            }
            title="Glossar"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onHome}
            className={
              isHomeActive
                ? 'text-zinc-100 bg-zinc-800/70 hover:bg-zinc-700/70'
                : 'text-zinc-600 hover:text-orange-400 hover:bg-zinc-900/50'
            }
            title="Episode overview (Home)"
          >
            <Home className="w-5 h-5" />
          </Button>
          {renderSettingsControl(
            'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
          )}
          {jumpMarker && onJumpToMarker && (
            <Button
              variant="ghost"
              onClick={onJumpToMarker}
              className="h-8 px-2 gap-1 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
              title={`Zu ${jumpMarker} springen`}
            >
              <TabletSmartphone className="w-4 h-4" />
              <span className="font-mono text-[11px]">{jumpMarker}</span>
            </Button>
          )}
        </div>

        {/* Mobile center */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="sm:hidden text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60"
          title="Menue"
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Right navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextScene}
            disabled={!canGoToNextScene}
            className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60 disabled:opacity-30"
            title="Next scene (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onForward}
            disabled={!canGoForward}
            className="hidden sm:inline-flex text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-30"
            title="Next episode (Shift+→)"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden relative px-3 pb-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onGlossary}
            className={
              isGlossaryActive
                ? 'text-zinc-100 bg-zinc-800/70 hover:bg-zinc-700/70'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
            }
            title="Glossar"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onHome}
            className={
              isHomeActive
                ? 'text-zinc-100 bg-zinc-800/70 hover:bg-zinc-700/70'
                : 'text-zinc-600 hover:text-orange-400 hover:bg-zinc-900/50'
            }
            title="Episode overview (Home)"
          >
            <Home className="w-5 h-5" />
          </Button>
          {renderSettingsControl('text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50')}
          {jumpMarker && onJumpToMarker && (
            <Button
              variant="ghost"
              onClick={onJumpToMarker}
              className="h-8 px-2 gap-1 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
              title={`Zu ${jumpMarker} springen`}
            >
              <TabletSmartphone className="w-4 h-4" />
              <span className="font-mono text-[11px]">{jumpMarker}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
