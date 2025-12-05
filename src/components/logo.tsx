'use client'

import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { width: 120, height: 28 },
  md: { width: 150, height: 36 },
  lg: { width: 180, height: 40 },
}

export function Logo({ href, className, size = 'md' }: LogoProps) {
  const dimensions = sizes[size]

  const logo = (
    <Image
      src="/logo.svg"
      alt="ListClose"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      priority
    />
  )

  if (href) {
    return <Link href={href}>{logo}</Link>
  }

  return logo
}
