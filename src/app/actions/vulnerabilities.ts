'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export async function getVulnerabilities() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const vulnerabilities = await prisma.vulnerability.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: { createdAt: 'desc' },
            include: {
                dread: true,
                stride: true,
            }
        })
        return { success: true, data: vulnerabilities }
    } catch (error) {
        console.error("Failed to fetch vulnerabilities:", error)
        return { success: false, error: "Failed to fetch vulnerabilities" }
    }
}

export async function getVulnerability(id: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const vulnerability = await prisma.vulnerability.findUnique({
            where: {
                id: id,
                userId: session.user.id
            },
            include: {
                dread: true,
                stride: true
            }
        })

        if (!vulnerability) {
            return { success: false, error: "Vulnerability not found" }
        }

        return { success: true, data: vulnerability }
    } catch (error) {
        return { success: false, error: "Failed to fetch vulnerability" }
    }
}

export async function createVulnerability(data: any) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const vuln = await prisma.vulnerability.create({
            data: {
                title: data.title,
                description: data.description,
                severity: data.severity,
                status: data.status,
                userId: session.user.id,
                dread: data.dread ? {
                    create: data.dread
                } : undefined,
                stride: data.stride ? {
                    create: data.stride
                } : undefined,
            }
        })

        await logAudit("CREATE_VULNERABILITY", "Vulnerability", vuln.id, `Created vulnerability: ${vuln.title}`)
        revalidatePath('/dashboard/vulnerabilities')
        return { success: true, data: vuln }
    } catch (error) {
        console.error("Failed to create vulnerability:", error)
        return { success: false, error: "Failed to create vulnerability" }
    }
}

export async function updateVulnerability(id: string, data: any) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Verify ownership
        const existing = await prisma.vulnerability.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!existing) {
            return { success: false, error: "Vulnerability not found" }
        }

        const vulnerability = await prisma.vulnerability.update({
            where: {
                id: id,
            },
            data: {
                title: data.title,
                description: data.description,
                severity: data.severity,
                status: data.status,
                dread: data.dread ? {
                    upsert: {
                        create: data.dread,
                        update: data.dread
                    }
                } : undefined,
                stride: data.stride ? {
                    upsert: {
                        create: data.stride,
                        update: data.stride
                    }
                } : undefined,
            }
        })

        await logAudit("UPDATE_VULNERABILITY", "Vulnerability", id, `Updated vulnerability: ${data.title}`)
        revalidatePath('/dashboard/vulnerabilities')
        revalidatePath(`/dashboard/vulnerabilities/${id}`)
        return { success: true, data: vulnerability }
    } catch (error) {
        return { success: false, error: "Failed to update vulnerability" }
    }
}

export async function updateVulnerabilityStatus(id: string, status: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Verify ownership
        const existing = await prisma.vulnerability.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!existing) {
            return { success: false, error: "Vulnerability not found" }
        }

        await prisma.vulnerability.update({
            where: { id },
            data: { status }
        })

        await logAudit("UPDATE_STATUS", "Vulnerability", id, `Status changed to ${status}`)
        revalidatePath('/dashboard/vulnerabilities')
        return { success: true }
    } catch (error) {
        console.error("Failed to update status:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function deleteVulnerability(id: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Verify ownership
        const existing = await prisma.vulnerability.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!existing) {
            return { success: false, error: "Vulnerability not found" }
        }

        // Delete related scores first
        await prisma.dreadScore.deleteMany({ where: { vulnerabilityId: id } })
        await prisma.strideScore.deleteMany({ where: { vulnerabilityId: id } })
        await prisma.comment.deleteMany({ where: { vulnerabilityId: id } })

        // Delete vulnerability
        await prisma.vulnerability.delete({ where: { id } })

        await logAudit("DELETE_VULNERABILITY", "Vulnerability", id, `Deleted vulnerability: ${existing.title}`)
        revalidatePath('/dashboard/vulnerabilities')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete vulnerability:", error)
        return { success: false, error: "Failed to delete vulnerability" }
    }
}
