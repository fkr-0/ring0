import { useState } from 'react'

interface TextureOverlayProps {
  theme?: 'void' | 'deep' | 'warm' | 'revolte'
  brightness?: number
}

interface AnimatedBackgroundProps {
  theme?: 'void' | 'deep' | 'warm' | 'revolte'
  brightness?: number
}

const THEME_ACCENTS = {
  void: {
    amber: [249, 115, 22],
    cyan: [6, 182, 212],
    green: [34, 197, 94],
    waveAmber: [249, 115, 22],
    waveCyan: [6, 182, 212],
    gradientFrom: '#05080c',
    gradientVia: '#0c1016',
    gradientTo: '#080a0f',
  },
  deep: {
    amber: [245, 158, 11],
    cyan: [59, 130, 246],
    green: [45, 212, 191],
    waveAmber: [245, 158, 11],
    waveCyan: [59, 130, 246],
    gradientFrom: '#08090e',
    gradientVia: '#15171f',
    gradientTo: '#10131b',
  },
  warm: {
    amber: [251, 146, 60],
    cyan: [239, 68, 68],
    green: [252, 211, 77],
    waveAmber: [251, 146, 60],
    waveCyan: [239, 68, 68],
    gradientFrom: '#120b08',
    gradientVia: '#1f1410',
    gradientTo: '#140e0b',
  },
  revolte: {
    amber: [251, 146, 60],
    cyan: [168, 85, 247],
    green: [251, 146, 60],
    waveAmber: [251, 146, 60],
    waveCyan: [168, 85, 247],
    gradientFrom: '#080912',
    gradientVia: '#131229',
    gradientTo: '#0a0914',
  },
} as const

function rgba(rgb: readonly number[], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

export function TextureOverlay({ theme = 'void', brightness = 0 }: TextureOverlayProps) {
  const [grainOpacity] = useState(0.03)
  const accent = THEME_ACCENTS[theme]
  const b = Math.max(0, Math.min(100, brightness)) / 100
  const accentBoost = 1 + b * 1.35

  return (
    <>
      {/* Film grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: grainOpacity,
        }}
      />

      {/* Vignette effect */}
      <div className="pointer-events-none fixed inset-0 z-40">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 100%)',
          }}
        />
      </div>

      {/* Scanline effect (subtle) */}
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.02]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 1px, #000 1px, #000 2px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Corner glow accents */}
      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        {/* Top left - warm amber */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: rgba(accent.amber, 0.05 * accentBoost) }}
        />

        {/* Bottom right - cool cyan */}
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
          style={{ backgroundColor: rgba(accent.cyan, 0.05 * accentBoost) }}
        />

        {/* Top right - subtle green for radioactive hint */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: rgba(accent.green, 0.03 * accentBoost) }}
        />
      </div>
    </>
  )
}

export function AnimatedBackground({ theme = 'void', brightness = 0 }: AnimatedBackgroundProps) {
  const accent = THEME_ACCENTS[theme]
  const b = Math.max(0, Math.min(100, brightness)) / 100
  const waveBoost = 1 + b * 1.5
  const veilOpacity = b * 0.12

  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${accent.gradientFrom}, ${accent.gradientVia}, ${accent.gradientTo})`,
        }}
      />
      {veilOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(255,255,255,${veilOpacity * 0.18})` }}
        />
      )}

      {/* Animated subtle waves */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse duration-[4000ms]"
          style={{ backgroundColor: rgba(accent.waveAmber, 0.2 * waveBoost) }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{
            backgroundColor: rgba(accent.waveCyan, 0.2 * waveBoost),
            animationDelay: '2000ms',
          }}
        />
      </div>

      {/* Grid pattern (very subtle) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  )
}
