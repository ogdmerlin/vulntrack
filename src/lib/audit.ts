import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function logAudit(action: string, entityType: string, entityId: string | null, details: string | null) {
    try {
        const session = await getServerSession(authOptions)
        const userId = session?.user?.id

        if (!userId) {
            console.warn("Audit log attempted without user session:", action)
            return
        }

        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                details,
                userId,
            }
        })
    } catch (error) {
        console.error("Failed to create audit log:", error)
    }
}
