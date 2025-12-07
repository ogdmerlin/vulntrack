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
        // Fetch user to get teamId
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true, role: true }
        })

        if (!user || (!user.teamId && user.role !== 'ADMIN')) {
            // If not in a team and not admin, might be an issue, but return empty
            return { success: true, data: [] }
            // Note: Admin might be first user without team if logic failed, but we handle that.
        }

        const teamId = user.teamId

        // Build Where Clause
        let whereClause: any = {
            teamId: teamId // Scope to team
        }

        // Visibility Logic
        if (user.role !== 'ADMIN') {
            // Non-Admins see APPROVED items OR their own items
            whereClause = {
                teamId: teamId,
                OR: [
                    { approvalStatus: "APPROVED" },
                    { userId: session.user.id }
                ]
            }
        } else {
            // Admins see everything in the team (implicit)
            // However, if teamId is null (super admin legacy), maybe show all?
            // For strict multi-tenancy, we stick to teamId.
        }

        // Handle "Global" Admin case (First User before team logic)
        // If teamId is null, we might show nothing or everything. 
        // Better to rely on teamId. If teamId is null, show only own assets.
        if (!teamId) {
            whereClause = { userId: session.user.id }
        }

        const vulnerabilities = await prisma.vulnerability.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                dread: true,
                stride: true,
                user: { select: { name: true, email: true } } // Include creator info
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
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true, role: true }
        })

        const vulnerability = await prisma.vulnerability.findUnique({
            where: { id },
            include: {
                dread: true,
                stride: true
            }
        })

        if (!vulnerability) {
            return { success: false, error: "Vulnerability not found" }
        }

        // Check Team Scope
        if (vulnerability.teamId !== user?.teamId && user?.role !== 'ADMIN') { // simple check, robust check needs to handle nulls
            // Actually, if teamIds mismatch, deny.
            // Allow if ADMIN and both have null teamId?
            if (vulnerability.teamId !== user?.teamId) {
                return { success: false, error: "Unauthorized" }
            }
        }

        // Check Status Visibility
        if (vulnerability.userId !== session.user.id && user?.role !== 'ADMIN' && vulnerability.approvalStatus !== 'APPROVED') {
            return { success: false, error: "Vulnerability pending approval" }
        }

        return { success: true, data: vulnerability }
    } catch (error) {
        return { success: false, error: "Failed to fetch vulnerability" }
    }
}

import { fetchCVEData } from "./nvd"

export async function createVulnerability(data: any) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true, role: true }
        })

        if (!user) return { success: false, error: "User not found" }

        let nvdData: any = {}
        if (data.cveId) {
            const fetched = await fetchCVEData(data.cveId)
            if (fetched) {
                nvdData = fetched
            }
        }

        const approvalStatus = user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'

        const vuln = await prisma.vulnerability.create({
            data: {
                title: data.title,
                description: nvdData.description || data.description,
                severity: data.severity,
                status: data.status,
                cveId: data.cveId,
                cvssScore: nvdData.cvssScore,
                references: nvdData.references,
                affectedSystems: nvdData.affectedSystems,
                userId: session.user.id,
                teamId: user.teamId, // Assign to team
                approvalStatus: approvalStatus,
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
        // Verify ownership (or admin)
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, teamId: true } })
        const existing = await prisma.vulnerability.findUnique({
            where: { id }
        })

        if (!existing) {
            return { success: false, error: "Vulnerability not found" }
        }

        // Authorization: Admin or Owner
        // And must be in same team
        if (existing.teamId !== user?.teamId) {
            return { success: false, error: "Unauthorized" }
        }

        if (existing.userId !== session.user.id && user?.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
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

export async function approveVulnerability(id: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const vulnerability = await prisma.vulnerability.update({
            where: { id },
            data: { approvalStatus: 'APPROVED' }
        })

        await logAudit("APPROVE_VULNERABILITY", "Vulnerability", id, `Approved vulnerability: ${vulnerability.title}`)
        revalidatePath('/dashboard/vulnerabilities')
        revalidatePath(`/dashboard/vulnerabilities/${id}`)
        return { success: true, data: vulnerability }
    } catch (error) {
        console.error("Failed to approve vulnerability:", error)
        return { success: false, error: "Failed to approve vulnerability" }
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
