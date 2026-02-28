import { Button } from '@/components/ui/button'
import { BookOpen, ChevronLeft, ChevronRight, Home, TabletSmartphone } from 'lucide-react'
import { useCallback } from 'react'
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
  settingsControl: ReactNode
  jumpMarker?: string
  onJumpToMarker?: () => void
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
  settingsControl,
  jumpMarker,
  onJumpToMarker,
}: NavigationControlsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (e.shiftKey && canGoBack) {
            e.preventDefault()
            onBack()
          } else if (canGoToPrevScene) {
            e.preventDefault()
            onPrevScene()
          }
          break
        case 'ArrowRight':
          if (e.shiftKey && canGoForward) {
            e.preventDefault()
            onForward()
          } else if (canGoToNextScene) {
            e.preventDefault()
            onNextScene()
          }
          break
        case 'Home':
          onHome()
          break
      }
    },
    [
      canGoBack,
      canGoForward,
      canGoToPrevScene,
      canGoToNextScene,
      onBack,
      onForward,
      onPrevScene,
      onNextScene,
      onHome,
    ]
  )

  // Note: In a real app, you'd add event listeners in an effect
  // For now, we'll just render the controls

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50 bg-zinc-950/50">
      {/* Left navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={!canGoBack}
          className="text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 disabled:opacity-30"
          title="Previous episode (Shift+←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevScene}
          disabled={!canGoToPrevScene}
          className="text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 disabled:opacity-30"
          title="Previous scene (←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Center - Home button */}
      <div className="flex items-center gap-1">
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
        {settingsControl}
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

      {/* Right navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextScene}
          disabled={!canGoToNextScene}
          className="text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 disabled:opacity-30"
          title="Next scene (→)"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onForward}
          disabled={!canGoForward}
          className="text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 disabled:opacity-30"
          title="Next episode (Shift+→)"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
