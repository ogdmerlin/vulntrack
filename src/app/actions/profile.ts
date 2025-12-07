'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function updateProfile(data: {
    name?: string
    phone?: string
    jobTitle?: string
    bio?: string
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: data.name,
                // Note: phone, jobTitle, bio would need to be added to schema
                // For now we just update the name
            }
        })

        await logAudit("UPDATE_PROFILE", "User", session.user.email, "Profile updated")
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error("updateProfile error:", error)
        return { success: false, error: "Failed to update profile" }
    }
}
