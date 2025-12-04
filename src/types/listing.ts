import { z } from "zod"

export const listingSchema = z.object({
  // Basics
  title: z.string().min(5, "Title must be at least 5 characters"),
  propertyType: z.enum([
    "SINGLE_FAMILY", "CONDO", "TOWNHOUSE", "MULTI_FAMILY", 
    "APARTMENT", "LAND", "COMMERCIAL", "MOBILE"
  ]),
  listingType: z.enum(["FOR_SALE", "FOR_RENT"]),
  status: z.enum(["DRAFT", "ACTIVE", "SOLD"]).default("DRAFT"),
  
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
  lotSize: z.coerce.number().optional(),
  yearBuilt: z.coerce.number().optional(),
  
  // Features
  features: z.array(z.string()).default([]),
  description: z.string().optional(),
  
  // Media
  photos: z.array(z.string()).default([]),
  
  // Financial
  price: z.coerce.number().min(0),
  hoaFee: z.coerce.number().optional(),
  taxAmount: z.coerce.number().optional(),
})

export type ListingFormData = z.infer<typeof listingSchema>
