'use client'

import { useActionState } from 'react'
import { forgotPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(forgotPassword, undefined)

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
            <CardTitle className="text-2xl font-bold text-foreground">Forgot password?</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          {state?.success ? (
            <CardContent className="space-y-4">
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                {state.message}
              </div>
              <div className="text-sm text-center text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          ) : (
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
                {state?.error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {state.error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full h-10" disabled={isPending}>
                  {isPending ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="text-sm text-center text-muted-foreground">
                  Remember your password?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> ListClose. All rights reserved.
      </footer>
    </div>
  )
}
