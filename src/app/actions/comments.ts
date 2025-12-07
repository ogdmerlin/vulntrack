'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function addComment(vulnerabilityId: string, content: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                vulnerabilityId,
                userId: session.user.id
            },
            include: {
                user: {
                    select: { name: true, email: true, image: true }
                }
            }
        })

        await logAudit("ADD_COMMENT", "Vulnerability", vulnerabilityId, `Comment added by ${session.user.email}`)
        revalidatePath(`/dashboard/vulnerabilities/${vulnerabilityId}`)
        return { success: true, data: comment }
    } catch (error) {
        return { success: false, error: "Failed to add comment" }
    }
}

export async function getComments(vulnerabilityId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { vulnerabilityId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true, image: true }
                }
            }
        })
        return { success: true, data: comments }
    } catch (error) {
        return { success: false, error: "Failed to fetch comments" }
    }
}
