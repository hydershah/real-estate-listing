'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User, Menu, X, Home, ShoppingBag } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  userName?: string | null
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AG'

  // Determine active tab based on pathname
  const isBuyerSection = pathname?.startsWith('/buyer')
  const isSellerSection = !isBuyerSection

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Logo href="/dashboard" />

        {/* Seller/Buyer Toggle */}
        <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isSellerSection
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-4 w-4" />
            Seller
          </Link>
          <Link
            href="/buyer"
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isBuyerSection
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            Buyer
          </Link>
        </div>

        {/* Desktop Navigation - Context-aware links */}
        <nav className="hidden md:flex items-center gap-6">
          {isSellerSection ? (
            <Link
              href="/listings/new"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              New Listing
            </Link>
          ) : (
            <Link
              href="/buyer/saved-homes/new"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Save a Home
            </Link>
          )}
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
                  <p className="font-medium">{userName || 'Agent'}</p>
                  <p className="text-xs text-muted-foreground">Real Estate Agent</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
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
          {/* Mobile Seller/Buyer Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-4">
            <Link
              href="/dashboard"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isSellerSection
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Seller
            </Link>
            <Link
              href="/buyer"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isBuyerSection
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              Buyer
            </Link>
          </div>

          <nav className="flex flex-col gap-3">
            {isSellerSection ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Seller Dashboard
                </Link>
                <Link
                  href="/listings/new"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  New Listing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/buyer"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Buyer Dashboard
                </Link>
                <Link
                  href="/buyer/saved-homes/new"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Save a Home
                </Link>
                <Link
                  href="/buyer/tours"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tours
                </Link>
                <Link
                  href="/buyer/offers"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Offers
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
