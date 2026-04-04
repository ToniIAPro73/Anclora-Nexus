'use client'

import { NEXUS_BRAND } from '../../lib/brand'

interface BrandLogoProps {
  className?: string
  size?: number
  src?: string
}

export function BrandLogo({ className = "", size = 64, src }: BrandLogoProps) {
  const logoSrc = src || NEXUS_BRAND.assets.logoPrimary

  return (
    <div
      className={`relative rounded-full bg-navy-deep flex items-center justify-center overflow-hidden border border-white/18 shadow-[0_0_18px_rgba(212,175,55,0.16)] ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={`${NEXUS_BRAND.name} logo`}
        className="w-full h-full object-cover"
        onError={(event) => {
          const target = event.currentTarget
          if (target.src !== `${window.location.origin}${NEXUS_BRAND.assets.logoFallback}`) {
            target.src = NEXUS_BRAND.assets.logoFallback
          }
        }}
      />
    </div>
  )
}
