import { z } from "zod"

// Enums (matching Prisma schema)
export const savedHomeStatusEnum = z.enum(["SAVED", "TOURING", "OFFER_SUBMITTED"])
export const tourStatusEnum = z.enum(["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELLED"])
export const offerStatusEnum = z.enum(["DRAFT", "SUBMITTED", "COUNTERED", "ACCEPTED", "REJECTED", "WITHDRAWN"])

// Helper for optional number fields that can receive empty strings from forms
const optionalNumber = z.union([
  z.number().min(0),
  z.literal(""),
  z.undefined(),
]).transform(val => val === "" ? undefined : val) as z.ZodType<number | undefined>

// Helper for required number fields that can receive empty strings from forms
const requiredNumber = z.union([
  z.number().min(1, "This field is required"),
  z.literal(""),
]).transform(val => {
  if (val === "") throw new Error("This field is required")
  return val
}) as z.ZodType<number>

// Saved Home Schema - used for form validation
export const savedHomeSchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  price: optionalNumber,
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  squareFeet: optionalNumber,
  listingUrl: z.union([
    z.string().url("Please enter a valid URL"),
    z.literal(""),
  ]).transform(val => val === "" ? undefined : val).optional(),
  notes: z.string().optional(),
})

// Tour Request Schema
export const tourRequestSchema = z.object({
  savedHomeId: z.string().min(1, "Property is required"),
  requestedDate: z.string().optional(), // ISO date string
  availability: z.string().optional(),
  notes: z.string().optional(),
})

// Update Tour Status Schema
export const updateTourStatusSchema = z.object({
  tourId: z.string().min(1, "Tour ID is required"),
  status: tourStatusEnum,
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
})

// Offer Schema
export const offerSchema = z.object({
  savedHomeId: z.string().min(1, "Property is required"),
  amount: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined
      const num = Number(val)
      return isNaN(num) ? undefined : num
    },
    z.number({ message: "Offer amount is required" }).min(1, "Offer amount must be at least $1")
  ),
  notes: z.string().optional(),
})

// Update Offer Status Schema
export const updateOfferStatusSchema = z.object({
  offerId: z.string().min(1, "Offer ID is required"),
  status: offerStatusEnum,
  notes: z.string().optional(),
})

// Type exports
export type SavedHomeStatus = z.infer<typeof savedHomeStatusEnum>
export type TourStatus = z.infer<typeof tourStatusEnum>
export type OfferStatus = z.infer<typeof offerStatusEnum>

// Form data types - explicitly defined to avoid zod inference issues
export type SavedHomeFormData = {
  address: string
  city?: string
  state?: string
  zipCode?: string
  price?: number | ""
  bedrooms?: number | ""
  bathrooms?: number | ""
  squareFeet?: number | ""
  listingUrl?: string
  notes?: string
}

export type TourRequestFormData = z.infer<typeof tourRequestSchema>
export type UpdateTourStatusData = z.infer<typeof updateTourStatusSchema>

export type OfferFormData = {
  savedHomeId: string
  amount: number
  notes?: string
}

export type UpdateOfferStatusData = z.infer<typeof updateOfferStatusSchema>

// Serialized types for client components (Decimal -> number)
export type SerializedSavedHome = {
  id: string
  userId: string
  address: string
  city: string | null
  state: string | null
  zipCode: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  listingUrl: string | null
  notes: string | null
  status: SavedHomeStatus
  createdAt: Date
  updatedAt: Date
}

export type SerializedTour = {
  id: string
  savedHomeId: string
  requestedDate: Date | null
  scheduledDate: Date | null
  availability: string | null
  status: TourStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
  savedHome?: SerializedSavedHome
}

export type SerializedOffer = {
  id: string
  savedHomeId: string
  amount: number | null
  status: OfferStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
  savedHome?: SerializedSavedHome
}
