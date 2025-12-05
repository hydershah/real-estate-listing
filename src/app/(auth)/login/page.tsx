'use client'

import { useActionState } from 'react'
import { authenticate } from '@/app/actions/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  const [errorMessage, action, isPending] = useActionState(authenticate, undefined)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <Logo href="/" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <form action={action} className="flex flex-col gap-6">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="agent@example.com"
                  required
                  className="bg-background border-border h-10"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-background border-border h-10"
                />
              </div>
              {errorMessage && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {errorMessage}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-10" disabled={isPending}>
                {isPending ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> ListClose. All rights reserved.
      </footer>
    </div>
  )
}
