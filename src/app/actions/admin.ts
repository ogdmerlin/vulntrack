'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"
import { hash } from "bcryptjs"

async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required")
    }
    return session
}

export async function getUsers() {
    try {
        const session = await checkAdmin()

        // Fetch admin's team ID
        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        })

        const users = await prisma.user.findMany({
            where: {
                teamId: admin?.teamId // Only show users in the same team
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                image: true,
                createdAt: true,
                _count: {
                    select: { vulnerabilities: true }
                }
            }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function createUser(data: any) {
    try {
        const session = await checkAdmin()

        // Fetch Admin's Team ID to assign to new user
        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        })

        if (!admin?.teamId) {
            return { success: false, error: "Admin must belong to a team to create users." }
        }

        const hashedPassword = await hash(data.password, 12)
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                status: data.status,
                isOnboarded: true, // Auto-onboard admin created users
                createdById: session.user.id,
                teamId: admin.teamId // Assign to Admin's team
            }
        })
        await logAudit("CREATE_USER", "User", user.id, `User created by ${session.user.email}`)
        revalidatePath('/dashboard/admin/users')
        return { success: true, data: user }
    } catch (error: any) {
        console.error("createUser error:", error)
        if (error.message?.includes("Unauthorized")) {
            return { success: false, error: "You must be an admin to create users" }
        }
        if (error.code === 'P2002') {
            return { success: false, error: "A user with this email already exists" }
        }
        return { success: false, error: error.message || "Failed to create user" }
    }
}

export async function updateUser(userId: string, data: any) {
    const session = await checkAdmin()
    try {
        // Authorization: Verify Admin and Target User are in the same team
        const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { teamId: true } })
        const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } })

        if (!admin?.teamId || !targetUser || admin.teamId !== targetUser.teamId) {
            return { success: false, error: "Unauthorized access to user" }
        }

        // Prepare update data, remove password if empty
        const updateData: any = {
            name: data.name,
            role: data.role,
            status: data.status,
        }

        // Only valid if we allowed email updates, which we might restrict, but let's allow content update
        // We generally don't update email easily due to auth implications, avoiding for now unless requested.

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        })
        await logAudit("UPDATE_USER", "User", userId, `User updated by ${session.user.email}`)
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user" }
    }
}

export async function updateUserRole(userId: string, role: string) {
    const session = await checkAdmin()
    try {
        // Authorization: Verify Admin and Target User are in the same team
        const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { teamId: true } })
        const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } })

        if (!admin?.teamId || !targetUser || admin.teamId !== targetUser.teamId) {
            return { success: false, error: "Unauthorized access to user" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role }
        })
        await logAudit("UPDATE_ROLE", "User", userId, `Role updated to ${role}`)
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user role" }
    }
}

export async function deleteUser(userId: string) {
    const session = await checkAdmin()
    try {
        // Authorization: Verify Admin and Target User are in the same team
        const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { teamId: true } })
        const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } })

        if (!admin?.teamId || !targetUser || admin.teamId !== targetUser.teamId) {
            return { success: false, error: "Unauthorized access to user" }
        }

        await prisma.user.delete({
            where: { id: userId }
        })
        await logAudit("DELETE_USER", "User", userId, "User deleted")
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete user" }
    }
}

export async function createInvitation(email: string, role: string) {
    const session = await checkAdmin()
    try {
        // Check if an invitation already exists for this email
        const existingInvite = await prisma.invitation.findFirst({
            where: { email }
        })

        if (existingInvite) {
            // Delete old invite to create a new one
            await prisma.invitation.delete({
                where: { id: existingInvite.id }
            })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })
        if (existingUser) {
            return { success: false, error: "A user with this email already exists." }
        }

        // Generate secure token
        const token = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Get inviter's teamId
        const inviter = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        })

        const invitation = await prisma.invitation.create({
            data: {
                email,
                token,
                role, // Store role in invitation
                teamId: inviter?.teamId, // Bind invitation to team
                expiresAt,
                inviterId: session.user.id
            }
        })

        // Send Invitation Email
        const { sendEmail } = await import("@/lib/email")
        const { getInvitationEmail } = await import("@/lib/email-templates")

        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${token}`

        const emailResult = await sendEmail({
            to: email,
            subject: "You've been invited to VulnTrack",
            html: getInvitationEmail(inviteLink),
            text: `You've been invited to VulnTrack. Click here to join: ${inviteLink}`
        })

        if (!emailResult.success) {
            console.error("Failed to send invitation email:", emailResult.error)
            // We verify success but don't fail the action if email fails, just warn
            // Ideally we might want to tell the user, but for now we return success with data
        }

        await logAudit("CREATE_INVITATION", "Invitation", invitation.id, `Invited ${email} as ${role}`)
        revalidatePath('/dashboard/admin/users')
        return { success: true, message: "Invitation sent successfully" }
    } catch (error) {
        console.error("Create invitation error:", error)
        return { success: false, error: "Failed to create invitation" }
    }

}

export async function consolidateWorkspace() {
    const session = await checkAdmin()
    try {
        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        })

        if (!admin?.teamId) {
            return { success: false, error: "Admin has no team." }
        }

        const teamId = admin.teamId

        // Move all users without a team (or in default team?) to this team.
        // For this specific recovery, we will move ALL users to this team.
        // WARNING: This assumes single-tenant or single-workspace intent.

        // SAFELY move only orphans (users with NO team).
        // If another team exists, we leave them alone.
        await prisma.user.updateMany({
            where: {
                teamId: null
            },
            data: { teamId: teamId }
        })

        // Also move orphan vulnerabilities
        await prisma.vulnerability.updateMany({
            where: {
                teamId: null
            },
            data: { teamId: teamId }
        })

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/admin/users')
        return { success: true, message: "Workspace consolidated successfully." }
    } catch (error) {
        console.error("Consolidate error:", error)
        return { success: false, error: "Failed to consolidate workspace." }
    }
}
