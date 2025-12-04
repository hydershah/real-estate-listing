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
