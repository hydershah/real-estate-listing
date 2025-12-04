'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, LayoutDashboard, Building, Menu, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface AdminHeaderProps {
  userName?: string | null
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">LIST</span>
            <span className="text-xl font-bold text-foreground">CLOSE</span>
            <span className="ml-2 text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded">ADMIN</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/listings"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Listings
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userName || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/listings" className="cursor-pointer">
                  <Building className="mr-2 h-4 w-4" />
                  Listings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4">
          <nav className="flex flex-col gap-3">
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/listings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Listings
            </Link>
            <button
              className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors text-left"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
