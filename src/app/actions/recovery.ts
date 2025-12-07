'use server'

import { rateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

export async function requestPasswordReset(email: string) {
    if (!rateLimit("password_reset", 3, 60000)) {
        return { success: false, error: "Too many attempts. Please try again later." }
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        // Return success even if user not found to prevent enumeration
        return { success: true, message: "If an account exists, a reset link has been sent." }
    }

    // Mock sending email
    const resetToken = Math.random().toString(36).substring(2, 15)
    console.log(`[MOCK EMAIL] Password reset for ${email}. Token: ${resetToken}`)
    console.log(`[MOCK LINK] http://localhost:3000/reset-password?token=${resetToken}`)

    return { success: true, message: "If an account exists, a reset link has been sent." }
}
