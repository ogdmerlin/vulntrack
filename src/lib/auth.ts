import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        newUser: "/onboarding" // Redirect new users here? NextAuth supports this but it's for OAuth.
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user) {
                    return null
                }

                if (!user.password) {
                    return null
                }

                const isPasswordValid = await compare(credentials.password, user.password)

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isOnboarded: user.isOnboarded,
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                    isOnboarded: token.isOnboarded,
                }
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.isOnboarded = user.isOnboarded
            }

            // If the session was updated, or just to be safe, we can refresh data from DB
            // However, fetching on every JWT call might be heavy. 
            // Let's use the trigger mechanism or just fetch if we have an ID.
            if (token.id) {
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: { role: true, isOnboarded: true }
                })
                if (freshUser) {
                    token.role = freshUser.role
                    token.isOnboarded = freshUser.isOnboarded
                }
            }
            return token
        }
    }
}
