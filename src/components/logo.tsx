'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

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
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const dimensions = sizes[size]

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'

  const logo = (
    <Image
      src={logoSrc}
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
