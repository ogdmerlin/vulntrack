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
                stride: true,
                assignedTo: { select: { id: true, name: true, email: true } }
            }
        })

        if (!vulnerability) {
            return { success: false, error: "Vulnerability not found" }
        }

        // Check Team Scope - STRICT ISOLATION
        // Admins are scoped to their team. They cannot see other teams' data.
        if (!user?.teamId || !vulnerability.teamId || user.teamId !== vulnerability.teamId) {
            return { success: false, error: "Unauthorized: Cross-tenant access denied" }
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

import { importCve } from "./cve"

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

        // Self-heal: Ensure Admin has a team
        if (!user.teamId && user.role === 'ADMIN') {
            const newTeam = await prisma.team.create({
                data: { name: "My Organization" }
            })
            await prisma.user.update({
                where: { id: session.user.id },
                data: { teamId: newTeam.id }
            })
            user.teamId = newTeam.id
        }

        let nvdData: any = {}
        if (data.cveId) {
            // Use the robust hybrid import (VulnCheck + NIST)
            const result = await importCve(data.cveId)
            if (result.success && result.data) {
                nvdData = result.data
            }
        }

        const approvalStatus = user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'

        // Prepare simplified references for DB if needed, but importCve returns stringified JSON already
        // nvdData.references and affectedSystems are ALREADY JSON strings from importCve

        // Check for duplicates within the team
        const existingVuln = await prisma.vulnerability.findFirst({
            where: {
                cveId: data.cveId,
                teamId: user.teamId
            }
        })

        if (existingVuln) {
            return { success: false, error: "This CVE has already been imported for your team." }
        }

        // Derive Asset from Affected Systems
        let assetName = "Unknown Asset"
        if (nvdData.affectedSystems) {
            try {
                const systems = JSON.parse(nvdData.affectedSystems)
                if (Array.isArray(systems) && systems.length > 0) {
                    // Extract product name from CPE or usage string
                    // e.g. "cpe:2.3:a:vendor:product:..." -> product
                    // But current logic might just be returning "vendor product". Use first item.
                    assetName = systems[0]
                }
            } catch (e) {
                // Keep default
            }
        }

        // Generate Default Mitigations if not present
        const defaultMitigations = JSON.stringify([
            {
                step: 1,
                title: "Review Vendor Advisory",
                desc: "Check the official vendor advisory for specific patch instructions and affected versions.",
                priority: "High",
                eta: "1 day"
            },
            {
                step: 2,
                title: "Apply Security Patches",
                desc: "Update the affected software to the latest secure version provided by the vendor.",
                priority: "Critical",
                eta: "3 days"
            }
        ])

        const vuln = await prisma.vulnerability.create({
            data: {
                title: nvdData.title || data.title,
                description: nvdData.description || data.description,
                severity: data.severity,
                status: "OPEN", // Force OPEN on creation
                cveId: data.cveId,
                cvssScore: nvdData.cvssScore,
                references: nvdData.references,
                affectedSystems: nvdData.affectedSystems,
                asset: assetName, // Save derived asset
                mitigations: defaultMitigations, // Save default mitigations
                userId: session.user.id,
                teamId: user.teamId,
                approvalStatus: approvalStatus,
                dread: data.dread ? {
                    create: data.dread
                } : (nvdData.dread ? { create: nvdData.dread } : undefined),
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
        // Authorization: Verify Admin belongs to the same team as the vulnerability
        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        })

        const existingVuln = await prisma.vulnerability.findUnique({
            where: { id },
            select: { teamId: true, title: true } // Need title for audit log
        })

        if (!existingVuln) {
            return { success: false, error: "Vulnerability not found" }
        }

        if (!admin?.teamId || admin.teamId !== existingVuln.teamId) {
            return { success: false, error: "Unauthorized access to vulnerability" }
        }

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

export async function assignVulnerability(vulnerabilityId: string, assigneeId: string | null) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, teamId: true }
        })

        if (user?.role !== 'ADMIN') {
            return { success: false, error: "Only admins can assign vulnerabilities" }
        }

        const vulnerability = await prisma.vulnerability.findUnique({
            where: { id: vulnerabilityId },
            select: { teamId: true, title: true }
        })

        if (!vulnerability) {
            return { success: false, error: "Vulnerability not found" }
        }

        // Make sure assignee is in the same team
        if (assigneeId) {
            const assignee = await prisma.user.findUnique({
                where: { id: assigneeId },
                select: { teamId: true, name: true }
            })

            if (!assignee || assignee.teamId !== vulnerability.teamId) {
                return { success: false, error: "Assignee must be in the same team" }
            }

            // Create notification for the assignee
            await prisma.notification.create({
                data: {
                    userId: assigneeId,
                    type: "ASSIGNMENT",
                    title: "New Vulnerability Assigned",
                    message: `You have been assigned to: ${vulnerability.title}`,
                    link: `/dashboard/vulnerabilities/${vulnerabilityId}`
                }
            })

            // Send Email Notification
            const { sendEmail } = await import("@/lib/email")
            const { getAssignmentEmail } = await import("@/lib/email-templates")

            // We need to fetch email if it wasn't selected (though we should update the query above)
            // But let's check if we selected it. The previous query selected 'name' but not 'email'.
            // To be safe and minimal change, let's just fetch it if we have the assignee object, 
            // or update the query in the same file if possible. 
            // The tool allows replacing a chunk. I will update the query in a separate edit or assume I can't see it?
            // I can't update line 441 in this chunk (it's outside range). 
            // I will fetch the email here to be safe and avoid multi-chunk complexity unless necessary.
            // Actually, I should update the query or fetch it. Fetching is safer for now.

            const assigneeUser = await prisma.user.findUnique({
                where: { id: assigneeId },
                select: { email: true }
            })

            if (assigneeUser?.email) {
                await sendEmail({
                    to: assigneeUser.email,
                    subject: `New Assignment: ${vulnerability.title}`,
                    html: getAssignmentEmail(vulnerability.title, vulnerabilityId),
                    text: `You have been assigned to vulnerability: ${vulnerability.title}. View it at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vulnerabilities/${vulnerabilityId}`
                })
            }

        }

        await prisma.vulnerability.update({
            where: { id: vulnerabilityId },
            data: { assignedToId: assigneeId }
        })

        await logAudit("ASSIGN_VULNERABILITY", "Vulnerability", vulnerabilityId,
            assigneeId ? `Assigned to user ${assigneeId}` : "Unassigned")

        revalidatePath('/dashboard/vulnerabilities')
        revalidatePath(`/dashboard/vulnerabilities/${vulnerabilityId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to assign vulnerability:", error)
        return { success: false, error: "Failed to assign vulnerability" }
    }
}

export async function getTeamMembers() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, name: true, email: true, teamId: true, role: true }
        })

        if (!user?.teamId) {
            // Self-heal: If Admin has no team, create one
            if (user?.role === 'ADMIN') {
                const newTeam = await prisma.team.create({
                    data: { name: "My Organization" }
                })
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { teamId: newTeam.id }
                })
                // Return the user as the single member for now
                return { success: true, data: [{ id: user.id, name: user.name, email: user.email, role: user.role }] }
            }
            return { success: true, data: [] }
        }

        const members = await prisma.user.findMany({
            where: { teamId: user.teamId },
            select: { id: true, name: true, email: true, role: true }
        })

        return { success: true, data: members }
    } catch (error) {
        console.error("Failed to get team members:", error)
        return { success: false, error: "Failed to get team members" }
    }
}
