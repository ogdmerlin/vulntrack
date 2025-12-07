'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getAuditLogs() {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { email: true }
                }
            },
            take: 100 // Limit to last 100 logs for now
        })
        return { success: true, data: logs }
    } catch (error) {
        return { success: false, error: "Failed to fetch audit logs" }
    }
}
