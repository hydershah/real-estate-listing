'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendListingCreatedEmails } from '@/lib/email'
import { listingSchema, ListingFormData } from '@/types/listing'
import { revalidatePath } from 'next/cache'

export async function createListing(data: ListingFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = listingSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
        status: 'DRAFT',
      },
    })

    // Send email notifications to user and admin
    sendListingCreatedEmails({
      listingTitle: listing.title,
      listingAddress: listing.address,
      listingCity: listing.city,
      listingState: listing.state,
      listingPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(listing.price)),
      userName: session.user.name || '',
      userEmail: session.user.email || '',
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to create listing:', error)
    return { error: 'Failed to create listing' }
  }
}

export async function deleteListing(listingId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return { error: 'Listing not found' }
    }

    if (listing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    await prisma.listing.delete({
      where: { id: listingId },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete listing:', error)
    return { error: 'Failed to delete listing' }
  }
}

export async function updateListing(id: string, data: ListingFormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = listingSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return { error: 'Not found' }
    
    if (listing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    await prisma.listing.update({
      where: { id },
      data: validatedFields.data,
    })
    
    revalidatePath('/dashboard')
    revalidatePath(`/listings/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update listing:', error)
    return { error: 'Failed to update listing' }
  }
}
