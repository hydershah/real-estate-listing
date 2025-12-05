import { z } from "zod"

export const listingPackageEnum = z.enum(["SMART_SELLER", "FULL_SERVICE_AGENT"])

// Helper for optional number fields from form inputs
const optionalNumber = z.union([z.number(), z.string(), z.undefined()])
  .transform((val) => {
    if (val === undefined || val === '') return undefined
    return typeof val === 'number' ? val : Number(val)
  })

export const listingSchema = z.object({
  // Basics
  title: z.string().optional(),
  propertyType: z.enum([
    "SINGLE_FAMILY", "CONDO", "TOWNHOUSE", "MULTI_FAMILY",
    "APARTMENT", "LAND", "COMMERCIAL", "MOBILE"
  ]),
  listingType: z.enum(["FOR_SALE", "FOR_RENT"]).default("FOR_SALE"),
  listingPackage: listingPackageEnum.default("SMART_SELLER"),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "PENDING_SALE", "SOLD", "EXPIRED"]).default("PENDING_REVIEW"),

  // Location
  address: z.string().min(5, "Address is required"),
  unitNumber: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),

  // Details
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  squareFeet: z.coerce.number().min(0),
  lotSize: optionalNumber,
  yearBuilt: optionalNumber,

  // Features
  features: z.array(z.string()).default([]),
  description: z.string().optional(),

  // Media (photos handled by ListClose team)
  photos: z.array(z.string()).default([]),

  // Financial
  price: z.coerce.number().min(0),
  hoaFee: optionalNumber,
  taxAmount: optionalNumber,
})

export type ListingFormData = z.infer<typeof listingSchema>
export type ListingPackage = z.infer<typeof listingPackageEnum>
