import { useEffect, useState } from 'react'

export function TextureOverlay() {
  const [grainOpacity, setGrainOpacity] = useState(0.03)

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
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        {/* Bottom right - cool cyan */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Top right - subtle green for radioactive hint */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/3 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      </div>
    </>
  )
}

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05080c] via-[#0c1016] to-[#080a0f]" />

      {/* Animated subtle waves */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse duration-[4000ms]" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2000ms' }}
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
