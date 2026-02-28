import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Settings, Type, Palette, Eye } from 'lucide-react'
import { useState } from 'react'

export interface ReaderSettings {
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  lineHeight: 'tight' | 'normal' | 'relaxed'
  fontFamily: 'sans' | 'serif' | 'mono'
  theme: 'void' | 'deep' | 'warm' | 'revolte'
  brightness: number
  showMotifs: boolean
  autoScroll: boolean
  scrollSpeed: number
}

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 'md',
  lineHeight: 'normal',
  fontFamily: 'mono',
  theme: 'void',
  brightness: 0,
  showMotifs: true,
  autoScroll: false,
  scrollSpeed: 1.0,
}

interface ReaderSettingsDialogProps {
  settings: ReaderSettings
  onSettingsChange: (settings: ReaderSettings) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  triggerClassName?: string
}

export function ReaderSettingsDialog({
  settings,
  onSettingsChange,
  open: openProp,
  onOpenChange,
  triggerClassName,
}: ReaderSettingsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    if (key === 'theme') {
      const nextTheme = value as ReaderSettings['theme']
      const disabledByBrightness =
        settings.brightness > 0 && (nextTheme === 'void' || nextTheme === 'deep')
      if (disabledByBrightness) return
    }

    if (key === 'brightness') {
      const nextBrightness = value as number
      const nextSettings = { ...settings, [key]: nextBrightness }
      if (nextBrightness > 0 && (nextSettings.theme === 'void' || nextSettings.theme === 'deep')) {
        nextSettings.theme = 'warm'
      }
      onSettingsChange(nextSettings)
      return
    }

    onSettingsChange({ ...settings, [key]: value })
  }

  const resetToDefaults = () => {
    onSettingsChange(DEFAULT_SETTINGS)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={triggerClassName || 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50'}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/95 border-zinc-800 text-zinc-300 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-200">Reading Experience</DialogTitle>
          <DialogDescription className="text-zinc-600">
            Customize your reading experience
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Typography */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-zinc-400">Typography</h3>
              </div>

              {/* Font size */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-600 uppercase tracking-wider">Font Size</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`px-3 py-2 text-sm rounded-sm border transition-all ${
                        settings.fontSize === size
                          ? 'border-orange-500/50 bg-orange-500/20 text-orange-400'
                          : 'border-zinc-800 bg-zinc-900/30 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {size === 'sm' ? 'Aa' : size === 'md' ? 'Aa' : size === 'lg' ? 'Aa' : 'Aa'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line height */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-600 uppercase tracking-wider">
                  Line Spacing
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['tight', 'normal', 'relaxed'] as const).map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => updateSetting('lineHeight', spacing)}
                      className={`px-3 py-2 text-sm rounded-sm border transition-all capitalize ${
                        settings.lineHeight === spacing
                          ? 'border-orange-500/50 bg-orange-500/20 text-orange-400'
                          : 'border-zinc-800 bg-zinc-900/30 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font family */}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-600 uppercase tracking-wider">
                  Font Family
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sans', 'serif', 'mono'] as const).map((family) => (
                    <button
                      key={family}
                      onClick={() => updateSetting('fontFamily', family)}
                      className={`px-3 py-2 text-sm rounded-sm border transition-all capitalize ${
                        settings.fontFamily === family
                          ? 'border-orange-500/50 bg-orange-500/20 text-orange-400'
                          : 'border-zinc-800 bg-zinc-900/30 text-zinc-600 hover:border-zinc-700'
                      } ${family === 'serif' ? 'font-serif' : family === 'mono' ? 'font-mono' : 'font-sans'}`}
                    >
                      {family}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Theme */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-zinc-400">Theme</h3>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-600 uppercase tracking-wider">Atmosphere</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(
                    [
                      { value: 'void', label: 'Void', desc: 'Deep black-blue' },
                      { value: 'deep', label: 'Deep', desc: 'Charcoal darkness' },
                      { value: 'warm', label: 'Warm', desc: 'Fire-lit shadows' },
                      { value: 'revolte', label: 'Revolte', desc: 'Reclaim the streets' },
                    ] as const
                  ).map((theme) => {
                    const disabled =
                      settings.brightness > 0 && (theme.value === 'void' || theme.value === 'deep')
                    return (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => updateSetting('theme', theme.value)}
                      disabled={disabled}
                      className={`p-3 rounded-sm border transition-all text-left ${
                        settings.theme === theme.value
                          ? 'border-orange-500/50 bg-orange-500/20'
                          : disabled
                            ? 'border-zinc-900 bg-zinc-950/40 text-zinc-700 cursor-not-allowed opacity-50'
                            : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-sm font-medium text-zinc-300">{theme.label}</div>
                      <div className="text-xs text-zinc-600 mt-1">{theme.desc}</div>
                      {disabled && (
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-2">
                          Disabled when brightness &gt; 0
                        </div>
                      )}
                    </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-600 uppercase tracking-wider">Brightness</Label>
                <div className="px-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.brightness}
                    onChange={(event) => updateSetting('brightness', Number(event.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="text-xs text-zinc-500 mt-1">Level {settings.brightness}</div>
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Display */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-zinc-400">Display</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => updateSetting('showMotifs', !settings.showMotifs)}
                  className={`w-full px-4 py-3 rounded-sm border transition-all text-left flex items-center justify-between ${
                    settings.showMotifs
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-zinc-800 bg-zinc-900/30'
                  }`}
                >
                  <span className="text-sm text-zinc-300">Show motif highlights</span>
                  <span
                    className={`w-10 h-5 rounded-full transition-colors ${
                      settings.showMotifs ? 'bg-green-500/30' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white/20 transition-transform ${
                        settings.showMotifs ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </span>
                </button>

                <button
                  onClick={() => updateSetting('autoScroll', !settings.autoScroll)}
                  className={`w-full px-4 py-3 rounded-sm border transition-all text-left flex items-center justify-between ${
                    settings.autoScroll
                      ? 'border-orange-500/50 bg-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900/30'
                  }`}
                >
                  <span className="text-sm text-zinc-300">Auto-scroll on navigation</span>
                  <span
                    className={`w-10 h-5 rounded-full transition-colors ${
                      settings.autoScroll ? 'bg-orange-500/30' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white/20 transition-transform ${
                        settings.autoScroll ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="flex gap-2 pt-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="text-zinc-600 hover:text-zinc-400"
          >
            Reset to Defaults
          </Button>
          <Button
            size="sm"
            onClick={() => setOpen(false)}
            className="ml-auto bg-orange-600 hover:bg-orange-500 text-white"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DEFAULT_SETTINGS }
