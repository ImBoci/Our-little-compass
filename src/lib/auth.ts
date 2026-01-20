import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          console.log("No password provided in credentials")
          return null
        }

        const adminPassword = process.env.ADMIN_PASSWORD
        console.log("Input Password:", credentials?.password)
        console.log("Stored Env Password:", adminPassword)

        if (!adminPassword) {
          console.error("ADMIN_PASSWORD environment variable not set")
          throw new Error("ADMIN_PASSWORD environment variable not set")
        }

        if (credentials.password === adminPassword) {
          console.log("Password match successful")
          return {
            id: "admin",
            name: "Admin",
            email: "admin@whattocook.app"
          }
        }

        console.log("Password mismatch")
        return null
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  }
}

export const getServerAuthSession = () => getServerSession(authOptions)