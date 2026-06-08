import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          coupleId: user.coupleId
        } as any
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.coupleId = (user as any).coupleId
        token.name = user.name
        token.role = (user as any).role
      } else if (token.id) {
        // Refresh coupleId and role from DB on each token access in case they just created/joined a space
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { coupleId: true, name: true, role: true }
        })
        if (dbUser) {
          token.coupleId = dbUser.coupleId
          token.name = dbUser.name
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).coupleId = token.coupleId;
        (session.user as any).name = token.name;
        (session.user as any).role = token.role;
      }
      return session
    }
  }
}

export const getServerAuthSession = () => getServerSession(authOptions)