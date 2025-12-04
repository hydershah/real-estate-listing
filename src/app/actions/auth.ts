'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function signup(prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        message: 'User already exists with this email.',
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Automatically sign in the user after successful registration
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message: 'Failed to sign in after registration.',
      }
    }
    // Re-throw redirect errors (signIn uses redirect internally)
    throw error
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function forgotPassword(prevState: any, formData: FormData) {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Please enter a valid email address.',
    }
  }

  const { email } = validatedFields.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success message to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      }
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save the token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    // Send the email
    await sendPasswordResetEmail(email, token)

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return {
      error: 'Something went wrong. Please try again.',
    }
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
})

export async function resetPassword(prevState: any, formData: FormData) {
  const validatedFields = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Password must be at least 6 characters.',
    }
  }

  const { token, password } = validatedFields.data

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return {
        error: 'Invalid or expired reset link.',
      }
    }

    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return {
        error: 'This reset link has expired. Please request a new one.',
      }
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return {
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      error: 'Something went wrong. Please try again.',
    }
  }
}
