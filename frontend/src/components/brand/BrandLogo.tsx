'use client'

interface BrandLogoProps {
  className?: string
  size?: number
  src?: string
}

export function BrandLogo({ className = "", size = 64, src }: BrandLogoProps) {
  const logoSrc = src || '/brand/logo-nexus.png'

  return (
    <div
      className={`relative rounded-full bg-navy-deep flex items-center justify-center overflow-hidden border border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} alt="Anclora Nexus logo" className="w-full h-full object-cover" />
    </div>
  )
}
