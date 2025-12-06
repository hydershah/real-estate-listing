'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
}

const sizes = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
}

export function Logo({ href, className, size = 'md', iconOnly = false }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const dimensions = sizes[size]

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  const logo = (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Image
        src="/logo-icon.png"
        alt="ListClose"
        width={dimensions.icon}
        height={dimensions.icon}
        priority
      />
      {!iconOnly && (
        <span className={`font-bold ${dimensions.text}`}>
          <span className="text-[#8DD4BE]">LIST</span>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>CLOSE</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{logo}</Link>
  }

  return logo
}
