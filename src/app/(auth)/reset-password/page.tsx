'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [state, action, isPending] = useActionState(resetPassword, undefined)

  if (!token) {
    return (
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Invalid Link</CardTitle>
          <CardDescription className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/forgot-password">
            <Button className="w-full h-10">Request New Link</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (state?.success) {
    return (
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Password Reset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            {state.message}
          </div>
          <Link href="/login">
            <Button className="w-full h-10">Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-border bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-foreground">Reset your password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="token" value={token} />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your new password"
              required
              minLength={6}
              className="bg-background border-border h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              required
              minLength={6}
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
            {isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">LIST</span>
          <span className="text-xl font-bold text-foreground">CLOSE</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <Card className="w-full max-w-md border-border bg-card">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">Loading...</div>
            </CardContent>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> ListClose. All rights reserved.
      </footer>
    </div>
  )
}
