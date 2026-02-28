import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { useCallback } from 'react'

interface NavigationControlsProps {
  canGoBack: boolean
  canGoForward: boolean
  canGoToPrevScene: boolean
  canGoToNextScene: boolean
  onBack: () => void
  onForward: () => void
  onPrevScene: () => void
  onNextScene: () => void
  onHome: () => void
}

export function NavigationControls({
  canGoBack,
  canGoForward,
  canGoToPrevScene,
  canGoToNextScene,
  onBack,
  onForward,
  onPrevScene,
  onNextScene,
  onHome,
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
      <Button
        variant="ghost"
        size="icon"
        onClick={onHome}
        className="text-zinc-600 hover:text-orange-400 hover:bg-zinc-900/50"
        title="Episode overview (Home)"
      >
        <Home className="w-5 h-5" />
      </Button>

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
