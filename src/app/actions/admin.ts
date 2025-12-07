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
        await checkAdmin()
        const users = await prisma.user.findMany({
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
        const hashedPassword = await hash(data.password, 12)
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                status: data.status,
                isOnboarded: true, // Auto-onboard admin created users
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
    await checkAdmin()
    try {
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
    await checkAdmin()
    try {
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

        const invitation = await prisma.invitation.create({
            data: {
                email,
                role,
                token,
                expiresAt,
                inviterId: session.user.id
            }
        })

        await logAudit("CREATE_INVITE", "Invitation", invitation.id, `Invitation created for ${email}`)
        revalidatePath('/dashboard/admin/users')

        return { success: true, data: { token, link: `/register?token=${token}` } }
    } catch (error) {
        console.error("Create invitation error:", error)
        return { success: false, error: "Failed to create invitation" }
    }
}
