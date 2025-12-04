'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Lock, Mail, Calendar, Loader2, Check, Eye, EyeOff, Shield } from 'lucide-react'
import { updateProfile, changePassword } from '@/app/actions/settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-red-500' }
    if (score === 2) return { score: 40, label: 'Fair', color: 'bg-orange-500' }
    if (score === 3) return { score: 60, label: 'Good', color: 'bg-yellow-500' }
    if (score === 4) return { score: 80, label: 'Strong', color: 'bg-lime-500' }
    return { score: 100, label: 'Excellent', color: 'bg-green-500' }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-2 animate-fade-in-up">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn(
          "font-medium transition-colors duration-300",
          strength.score <= 40 ? "text-red-500" :
          strength.score <= 60 ? "text-yellow-500" : "text-green-500"
        )}>
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border skeleton" />
      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-32 rounded skeleton" />
          <div className="h-4 w-64 rounded skeleton" />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <div className="h-6 w-48 rounded skeleton" />
            <div className="h-4 w-64 rounded skeleton" />
            <div className="space-y-3">
              <div className="h-10 rounded skeleton" />
              <div className="h-10 rounded skeleton" />
            </div>
          </div>
          <div className="rounded-lg border border-border p-6 space-y-4">
            <div className="h-6 w-48 rounded skeleton" />
            <div className="h-4 w-64 rounded skeleton" />
            <div className="space-y-3">
              <div className="h-10 rounded skeleton" />
              <div className="h-10 rounded skeleton" />
              <div className="h-10 rounded skeleton" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SuccessIcon({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="animate-scale-in">
      <Check className="h-4 w-4 text-green-500" />
    </div>
  )
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <LoadingSkeleton />
  }

  if (!session?.user) {
    return null
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsUpdatingProfile(true)
    setProfileSuccess(false)

    try {
      const formData = new FormData()
      formData.append('name', name)

      const result = await updateProfile(formData)

      if (result?.error) {
        toast.error(result.error)
      } else {
        setProfileSuccess(true)
        toast.success('Profile updated successfully')
        await update({ name })
        setTimeout(() => setProfileSuccess(false), 3000)
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsChangingPassword(true)
    setPasswordSuccess(false)

    try {
      const formData = new FormData()
      formData.append('currentPassword', currentPassword)
      formData.append('newPassword', newPassword)

      const result = await changePassword(formData)

      if (result?.error) {
        toast.error(result.error)
      } else {
        setPasswordSuccess(true)
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch {
      toast.error('Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const memberSince = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A'

  const initials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={session.user.name} />

      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card with Avatar */}
          <Card className="interactive-card opacity-0 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative group">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-teal-light flex items-center justify-center text-xl font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
                    {initials}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Update your personal information and how others see you.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2 input-wrapper">
                  <Label htmlFor="name" className="floating-label flex items-center gap-2 text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-interactive h-11"
                  />
                </div>

                <div className="space-y-2 input-wrapper">
                  <Label htmlFor="email" className="floating-label flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={session.user.email || ''}
                    disabled
                    className="bg-muted/50 h-11 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Email cannot be changed for security reasons.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2.5 transition-colors duration-300 hover:bg-muted/50">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Member since <span className="font-medium text-foreground">{memberSince}</span></span>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn-press min-w-[140px] transition-all duration-300"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : profileSuccess ? (
                      <>
                        <SuccessIcon show={true} />
                        Saved!
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Separator className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }} />

          {/* Change Password Card */}
          <Card className="interactive-card opacity-0 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Keep your account secure with a strong password.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-2 input-wrapper">
                  <Label htmlFor="currentPassword" className="floating-label text-sm font-medium">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="input-interactive h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 input-wrapper">
                  <Label htmlFor="newPassword" className="floating-label text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="input-interactive h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={newPassword} />
                </div>

                <div className="space-y-2 input-wrapper">
                  <Label htmlFor="confirmPassword" className="floating-label text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={cn(
                        "input-interactive h-11 pr-10 transition-all duration-200",
                        confirmPassword && newPassword && confirmPassword !== newPassword && "border-red-500 focus-visible:ring-red-500/50"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && newPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 animate-fade-in-up">
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && newPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-green-500 flex items-center gap-1 animate-fade-in-up">
                      <Check className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="btn-press min-w-[160px] transition-all duration-300"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : passwordSuccess ? (
                      <>
                        <SuccessIcon show={true} />
                        Changed!
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
