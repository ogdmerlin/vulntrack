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
    department?: string
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
                phone: data.phone,
                jobTitle: data.jobTitle,
                department: data.department,
                bio: data.bio
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

export async function getProfile() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                image: true,
                phone: true,
                jobTitle: true,
                department: true,
                bio: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })
        return { success: true, data: user }
    } catch (error) {
        return { success: false, error: "Failed to fetch profile" }
    }
}
