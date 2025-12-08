'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

// ... imports

export async function addComment(vulnerabilityId: string, content: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Authorization: Verify user belongs to the same team as the vulnerability
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        })

        const vuln = await prisma.vulnerability.findUnique({
            where: { id: vulnerabilityId },
            select: { teamId: true }
        })

        if (!user?.teamId || !vuln || user.teamId !== vuln.teamId) {
            return { success: false, error: "Unauthorized access to vulnerability" }
        }

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
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Authorization Check
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        })

        const vuln = await prisma.vulnerability.findUnique({
            where: { id: vulnerabilityId },
            select: { teamId: true }
        })

        if (!user?.teamId || !vuln || user.teamId !== vuln.teamId) {
            // Return empty or unauthorized. For safety, fail.
            return { success: false, error: "Unauthorized" }
        }

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
