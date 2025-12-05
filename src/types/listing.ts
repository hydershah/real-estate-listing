import { z } from "zod"

export const listingPackageEnum = z.enum(["SMART_SELLER", "FULL_SERVICE_AGENT"])

export const listingSchema = z.object({
  // Basics
  title: z.string().optional(),
  propertyType: z.enum([
    "SINGLE_FAMILY", "CONDO", "TOWNHOUSE", "MULTI_FAMILY",
    "APARTMENT", "LAND", "COMMERCIAL", "MOBILE"
  ]),
  listingType: z.enum(["FOR_SALE", "FOR_RENT"]).default("FOR_SALE"),
  listingPackage: listingPackageEnum.optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "PENDING_SALE", "SOLD", "EXPIRED"]).default("DRAFT"),

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
  lotSize: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  yearBuilt: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1800).max(new Date().getFullYear() + 1).optional()
  ),

  // Features
  features: z.array(z.string()).default([]),
  description: z.string().default(""),

  // Media
  photos: z.array(z.string()).default([]),

  // Financial
  price: z.coerce.number().min(0),
  hoaFee: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  taxAmount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
})

export type ListingFormData = z.infer<typeof listingSchema>
export type ListingPackage = z.infer<typeof listingPackageEnum>
