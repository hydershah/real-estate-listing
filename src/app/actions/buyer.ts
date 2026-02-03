'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendTourRequestEmails, sendOfferSubmittedEmails } from '@/lib/email'
import {
  savedHomeSchema,
  tourRequestSchema,
  offerSchema,
  updateTourStatusSchema,
  updateOfferStatusSchema,
  type SavedHomeFormData,
  type TourRequestFormData,
  type OfferFormData,
  type UpdateTourStatusData,
  type UpdateOfferStatusData,
} from '@/types/buyer'

// ==========================================
// SAVED HOMES ACTIONS
// ==========================================

export async function createSavedHome(data: SavedHomeFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = savedHomeSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Invalid fields' }
  }

  try {
    await prisma.savedHome.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
      },
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/saved-homes')
    return { success: true }
  } catch (error) {
    console.error('Failed to save home:', error)
    return { error: 'Failed to save home' }
  }
}

export async function updateSavedHome(id: string, data: SavedHomeFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = savedHomeSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Invalid fields' }
  }

  try {
    const savedHome = await prisma.savedHome.findUnique({ where: { id } })

    if (!savedHome) {
      return { error: 'Saved home not found' }
    }

    if (savedHome.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.savedHome.update({
      where: { id },
      data: validatedFields.data,
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/saved-homes')
    revalidatePath(`/buyer/saved-homes/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update saved home:', error)
    return { error: 'Failed to update saved home' }
  }
}

export async function deleteSavedHome(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const savedHome = await prisma.savedHome.findUnique({ where: { id } })

    if (!savedHome) {
      return { error: 'Saved home not found' }
    }

    if (savedHome.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.savedHome.delete({ where: { id } })

    revalidatePath('/buyer')
    revalidatePath('/buyer/saved-homes')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete saved home:', error)
    return { error: 'Failed to delete saved home' }
  }
}

export async function updateSavedHomeStatus(id: string, status: 'SAVED' | 'TOURING' | 'OFFER_SUBMITTED') {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const savedHome = await prisma.savedHome.findUnique({ where: { id } })

    if (!savedHome) {
      return { error: 'Saved home not found' }
    }

    if (savedHome.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.savedHome.update({
      where: { id },
      data: { status },
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/saved-homes')
    revalidatePath(`/buyer/saved-homes/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update saved home status:', error)
    return { error: 'Failed to update status' }
  }
}

// ==========================================
// TOUR ACTIONS
// ==========================================

export async function requestTour(data: TourRequestFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = tourRequestSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Invalid fields' }
  }

  try {
    // Verify the saved home belongs to the user
    const savedHome = await prisma.savedHome.findUnique({
      where: { id: validatedFields.data.savedHomeId },
    })

    if (!savedHome) {
      return { error: 'Saved home not found' }
    }

    if (savedHome.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    // Create the tour request
    await prisma.tour.create({
      data: {
        savedHomeId: validatedFields.data.savedHomeId,
        requestedDate: validatedFields.data.requestedDate
          ? new Date(validatedFields.data.requestedDate)
          : null,
        availability: validatedFields.data.availability,
        notes: validatedFields.data.notes,
        status: 'REQUESTED',
      },
    })

    // Update saved home status to TOURING
    await prisma.savedHome.update({
      where: { id: validatedFields.data.savedHomeId },
      data: { status: 'TOURING' },
    })

    // Send email notifications
    sendTourRequestEmails({
      propertyAddress: savedHome.address,
      propertyCity: savedHome.city,
      propertyState: savedHome.state,
      requestedDate: validatedFields.data.requestedDate || null,
      availability: validatedFields.data.availability,
      notes: validatedFields.data.notes,
      userName: session.user.name || '',
      userEmail: session.user.email || '',
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/tours')
    revalidatePath(`/buyer/saved-homes/${validatedFields.data.savedHomeId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to request tour:', error)
    return { error: 'Failed to request tour' }
  }
}

export async function updateTourStatus(data: UpdateTourStatusData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = updateTourStatusSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Invalid fields' }
  }

  try {
    const tour = await prisma.tour.findUnique({
      where: { id: validatedFields.data.tourId },
      include: { savedHome: true },
    })

    if (!tour) {
      return { error: 'Tour not found' }
    }

    if (tour.savedHome.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    await prisma.tour.update({
      where: { id: validatedFields.data.tourId },
      data: {
        status: validatedFields.data.status,
        scheduledDate: validatedFields.data.scheduledDate
          ? new Date(validatedFields.data.scheduledDate)
          : undefined,
        notes: validatedFields.data.notes,
      },
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/tours')
    return { success: true }
  } catch (error) {
    console.error('Failed to update tour status:', error)
    return { error: 'Failed to update tour status' }
  }
}

export async function cancelTour(tourId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: { savedHome: true },
    })

    if (!tour) {
      return { error: 'Tour not found' }
    }

    if (tour.savedHome.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.tour.update({
      where: { id: tourId },
      data: { status: 'CANCELLED' },
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/tours')
    return { success: true }
  } catch (error) {
    console.error('Failed to cancel tour:', error)
    return { error: 'Failed to cancel tour' }
  }
}

// ==========================================
// OFFER ACTIONS
// ==========================================

export async function createOffer(data: OfferFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = offerSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Invalid fields' }
  }

  try {
    // Verify the saved home belongs to the user
    const savedHome = await prisma.savedHome.findUnique({
      where: { id: validatedFields.data.savedHomeId },
    })

    if (!savedHome) {
      return { error: 'Saved home not found' }
    }

    if (savedHome.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    // Check if an offer already exists for this saved home
    const existingOffer = await prisma.offer.findUnique({
      where: { savedHomeId: validatedFields.data.savedHomeId },
    })

    if (existingOffer) {
      return { error: 'An offer already exists for this property' }
    }

    // Create the offer
    await prisma.offer.create({
      data: {
        savedHomeId: validatedFields.data.savedHomeId,
        amount: validatedFields.data.amount,
        notes: validatedFields.data.notes,
        status: 'SUBMITTED',
      },
    })

    // Update saved home status to OFFER_SUBMITTED
    await prisma.savedHome.update({
      where: { id: validatedFields.data.savedHomeId },
      data: { status: 'OFFER_SUBMITTED' },
    })

    // Send email notifications
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(validatedFields.data.amount)

    sendOfferSubmittedEmails({
      propertyAddress: savedHome.address,
      propertyCity: savedHome.city,
      propertyState: savedHome.state,
      offerAmount: formattedAmount,
      notes: validatedFields.data.notes,
      userName: session.user.name || '',
      userEmail: session.user.email || '',
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/offers')
    revalidatePath(`/buyer/saved-homes/${validatedFields.data.savedHomeId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to create offer:', error)
    return { error: 'Failed to submit offer' }
  }
}

export async function updateOfferStatus(data: UpdateOfferStatusData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const validatedFields = updateOfferStatusSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Invalid fields' }
  }

  try {
    const offer = await prisma.offer.findUnique({
      where: { id: validatedFields.data.offerId },
      include: { savedHome: true },
    })

    if (!offer) {
      return { error: 'Offer not found' }
    }

    if (offer.savedHome.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    await prisma.offer.update({
      where: { id: validatedFields.data.offerId },
      data: {
        status: validatedFields.data.status,
        notes: validatedFields.data.notes,
      },
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/offers')
    return { success: true }
  } catch (error) {
    console.error('Failed to update offer status:', error)
    return { error: 'Failed to update offer status' }
  }
}

export async function withdrawOffer(offerId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { savedHome: true },
    })

    if (!offer) {
      return { error: 'Offer not found' }
    }

    if (offer.savedHome.userId !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'WITHDRAWN' },
    })

    // Revert saved home status back to TOURING or SAVED
    await prisma.savedHome.update({
      where: { id: offer.savedHomeId },
      data: { status: 'SAVED' },
    })

    revalidatePath('/buyer')
    revalidatePath('/buyer/offers')
    return { success: true }
  } catch (error) {
    console.error('Failed to withdraw offer:', error)
    return { error: 'Failed to withdraw offer' }
  }
}
