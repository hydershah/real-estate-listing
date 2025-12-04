import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role: string
    createdAt: Date | string
  }

  interface Session {
    user: {
      id: string
      role: string
      createdAt: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    createdAt: string
  }
}
