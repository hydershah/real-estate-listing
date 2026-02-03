import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'

interface ListingEmailData {
  listingTitle: string
  listingAddress: string
  listingCity: string
  listingState: string
  listingPrice: string
  userName: string
  userEmail: string
}

export async function sendListingCreatedEmailToUser(data: ListingEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `Your listing "${data.listingTitle}" has been created`,
      html: `
        <h1>Your Listing Has Been Created!</h1>
        <p>Hi ${data.userName || 'there'},</p>
        <p>Your listing has been successfully created and is currently in draft status.</p>

        <h2>Listing Details:</h2>
        <ul>
          <li><strong>Title:</strong> ${data.listingTitle}</li>
          <li><strong>Address:</strong> ${data.listingAddress}</li>
          <li><strong>Location:</strong> ${data.listingCity}, ${data.listingState}</li>
          <li><strong>Price:</strong> ${data.listingPrice}</li>
        </ul>

        <p>You can view and manage your listing from your dashboard.</p>

        <p>Thank you for using our platform!</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send user email:', error)
  }
}

export async function sendListingCreatedEmailToAdmin(data: ListingEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Listing Created: "${data.listingTitle}"`,
      html: `
        <h1>New Listing Created</h1>
        <p>A new listing has been created on the platform.</p>

        <h2>Listing Details:</h2>
        <ul>
          <li><strong>Title:</strong> ${data.listingTitle}</li>
          <li><strong>Address:</strong> ${data.listingAddress}</li>
          <li><strong>Location:</strong> ${data.listingCity}, ${data.listingState}</li>
          <li><strong>Price:</strong> ${data.listingPrice}</li>
        </ul>

        <h2>Submitted By:</h2>
        <ul>
          <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
          <li><strong>Email:</strong> ${data.userEmail}</li>
        </ul>

        <p>Please review this listing in the admin dashboard.</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send admin email:', error)
  }
}

export async function sendListingCreatedEmails(data: ListingEmailData) {
  await Promise.all([
    sendListingCreatedEmailToUser(data),
    sendListingCreatedEmailToAdmin(data),
  ])
}

// ==========================================
// BUYER DASHBOARD EMAILS
// ==========================================

interface TourRequestEmailData {
  propertyAddress: string
  propertyCity?: string | null
  propertyState?: string | null
  requestedDate?: string | null
  availability?: string | null
  notes?: string | null
  userName: string
  userEmail: string
}

interface OfferSubmittedEmailData {
  propertyAddress: string
  propertyCity?: string | null
  propertyState?: string | null
  offerAmount: string
  notes?: string | null
  userName: string
  userEmail: string
}

export async function sendTourRequestEmailToUser(data: TourRequestEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `Tour Request Submitted: ${data.propertyAddress}`,
      html: `
        <h1>Tour Request Submitted!</h1>
        <p>Hi ${data.userName || 'there'},</p>
        <p>Your tour request has been submitted. The ListClose team will contact you soon to coordinate the details.</p>

        <h2>Property:</h2>
        <ul>
          <li><strong>Address:</strong> ${data.propertyAddress}</li>
          ${data.propertyCity || data.propertyState ? `<li><strong>Location:</strong> ${[data.propertyCity, data.propertyState].filter(Boolean).join(', ')}</li>` : ''}
        </ul>

        <h2>Tour Details:</h2>
        <ul>
          ${data.requestedDate ? `<li><strong>Preferred Date:</strong> ${data.requestedDate}</li>` : ''}
          ${data.availability ? `<li><strong>Availability:</strong> ${data.availability}</li>` : ''}
          ${data.notes ? `<li><strong>Notes:</strong> ${data.notes}</li>` : ''}
        </ul>

        <p>We'll be in touch shortly!</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send tour request email to user:', error)
  }
}

export async function sendTourRequestEmailToAdmin(data: TourRequestEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Tour Request: ${data.propertyAddress}`,
      html: `
        <h1>New Tour Request</h1>
        <p>A buyer has requested a property tour.</p>

        <h2>Property:</h2>
        <ul>
          <li><strong>Address:</strong> ${data.propertyAddress}</li>
          ${data.propertyCity || data.propertyState ? `<li><strong>Location:</strong> ${[data.propertyCity, data.propertyState].filter(Boolean).join(', ')}</li>` : ''}
        </ul>

        <h2>Tour Details:</h2>
        <ul>
          ${data.requestedDate ? `<li><strong>Preferred Date:</strong> ${data.requestedDate}</li>` : ''}
          ${data.availability ? `<li><strong>Availability:</strong> ${data.availability}</li>` : ''}
          ${data.notes ? `<li><strong>Notes:</strong> ${data.notes}</li>` : ''}
        </ul>

        <h2>Buyer Info:</h2>
        <ul>
          <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
          <li><strong>Email:</strong> ${data.userEmail}</li>
        </ul>

        <p>Please follow up with the buyer to coordinate the tour.</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send tour request email to admin:', error)
  }
}

export async function sendTourRequestEmails(data: TourRequestEmailData) {
  await Promise.all([
    sendTourRequestEmailToUser(data),
    sendTourRequestEmailToAdmin(data),
  ])
}

export async function sendOfferSubmittedEmailToUser(data: OfferSubmittedEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `Offer Submitted: ${data.propertyAddress}`,
      html: `
        <h1>Offer Submitted!</h1>
        <p>Hi ${data.userName || 'there'},</p>
        <p>Your offer has been submitted. The ListClose team will prepare the formal offer and keep you updated on its status.</p>

        <h2>Property:</h2>
        <ul>
          <li><strong>Address:</strong> ${data.propertyAddress}</li>
          ${data.propertyCity || data.propertyState ? `<li><strong>Location:</strong> ${[data.propertyCity, data.propertyState].filter(Boolean).join(', ')}</li>` : ''}
        </ul>

        <h2>Offer Details:</h2>
        <ul>
          <li><strong>Offer Amount:</strong> ${data.offerAmount}</li>
          ${data.notes ? `<li><strong>Notes:</strong> ${data.notes}</li>` : ''}
        </ul>

        <p>We'll be in touch with updates!</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send offer submitted email to user:', error)
  }
}

export async function sendOfferSubmittedEmailToAdmin(data: OfferSubmittedEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Offer Submitted: ${data.propertyAddress}`,
      html: `
        <h1>New Offer Submitted</h1>
        <p>A buyer has submitted an offer on a property.</p>

        <h2>Property:</h2>
        <ul>
          <li><strong>Address:</strong> ${data.propertyAddress}</li>
          ${data.propertyCity || data.propertyState ? `<li><strong>Location:</strong> ${[data.propertyCity, data.propertyState].filter(Boolean).join(', ')}</li>` : ''}
        </ul>

        <h2>Offer Details:</h2>
        <ul>
          <li><strong>Offer Amount:</strong> ${data.offerAmount}</li>
          ${data.notes ? `<li><strong>Notes:</strong> ${data.notes}</li>` : ''}
        </ul>

        <h2>Buyer Info:</h2>
        <ul>
          <li><strong>Name:</strong> ${data.userName || 'N/A'}</li>
          <li><strong>Email:</strong> ${data.userEmail}</li>
        </ul>

        <p>Please prepare the formal offer and follow up with the buyer.</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send offer submitted email to admin:', error)
  }
}

export async function sendOfferSubmittedEmails(data: OfferSubmittedEmailData) {
  await Promise.all([
    sendOfferSubmittedEmailToUser(data),
    sendOfferSubmittedEmailToAdmin(data),
  ])
}

// ==========================================
// PASSWORD RESET
// ==========================================

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
