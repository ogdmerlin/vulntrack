'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function updateProfile(data: { name: string; image?: string }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                image: data.image,
                isOnboarded: true
            }
        })

        await logAudit("UPDATE_PROFILE", "User", session.user.id, "User updated profile")
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/settings')
        return { success: true }

    } catch (error) {
        return { success: false, error: "Failed to update profile" }
    }
}
