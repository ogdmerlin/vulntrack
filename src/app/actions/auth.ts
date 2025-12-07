'use server'

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

import { rateLimit } from "@/lib/rate-limit"

export async function registerUser(data: any) {
    // Rate Limiting: 5 attempts per minute per IP (mock IP for server action)
    // In a real app, we'd get the IP from headers().get("x-forwarded-for")
    if (!rateLimit("registration_attempt", 5, 60000)) {
        return { success: false, error: "Too many attempts. Please try again later." }
    }

    try {
        const { email, password, name } = data

        // Password Policy: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        if (!passwordRegex.test(password)) {
            return { success: false, error: "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol." }
        }

        if (!email || !password) {
            return { success: false, error: "Missing required fields" }
        }

        // Check if this is the FIRST user ever
        const userCount = await prisma.user.count()
        let role = "VIEWER" // Default role
        let invitationId = null

        if (userCount === 0) {
            // First user becomes ADMIN
            role = "ADMIN"
        } else {
            // Subsequent users require a valid token
            const token = data.token
            if (!token) {
                return { success: false, error: "Registration is invite-only. Please provide a valid invitation token." }
            }

            const invitation = await prisma.invitation.findUnique({
                where: { token }
            })

            if (!invitation) {
                return { success: false, error: "Invalid invitation token." }
            }

            if (invitation.expiresAt < new Date()) {
                return { success: false, error: "Invitation expired." }
            }

            if (invitation.email.toLowerCase() !== email.toLowerCase()) {
                return { success: false, error: "Email does not match invitation." }
            }

            role = invitation.role
            invitationId = invitation.id
        }

        // Check if user exists (Double check)
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { success: false, error: "User already exists" }
        }

        // Hash password
        const hashedPassword = await hash(password, 10)

        // Create user data object
        let userData: any = {
            email,
            name,
            password: hashedPassword,
            role: role,
            isOnboarded: role === 'ADMIN' ? true : false,
        }

        // Handle Team Assignment
        if (userCount === 0) {
            // First user creates the default team
            const team = await prisma.team.create({
                data: {
                    name: "Didactic Organization" // Default name
                }
            })
            userData.teamId = team.id
        } else if (invitationId) {
            // Find invitation details to get team
            const invitation = await prisma.invitation.findUnique({
                where: { id: invitationId }
            })

            if (invitation && invitation.teamId) {
                userData.teamId = invitation.teamId
            } else if (invitation) {
                // Fallback: fetch inviter's team
                const inviter = await prisma.user.findUnique({ where: { id: invitation.inviterId } })
                if (inviter?.teamId) userData.teamId = inviter.teamId
            }
        }

        // Create user
        const user = await prisma.user.create({
            data: userData
        })

        // Delete invitation if it was used
        if (invitationId) {
            await prisma.invitation.delete({
                where: { id: invitationId }
            })
        }

        return { success: true, data: { id: user.id, email: user.email, name: user.name } }
    } catch (error) {
        console.error("Registration error:", error)
        return { success: false, error: "Failed to create account" }
    }
}
