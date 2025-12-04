'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string

    // Get user to determine role-based redirect
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    })

    const redirectTo = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}
