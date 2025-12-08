'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        const unreadCount = await prisma.notification.count({
            where: { userId: session.user.id, read: false }
        })

        return { success: true, data: { notifications, unreadCount } }
    } catch (error) {
        console.error("Failed to get notifications:", error)
        return { success: false, error: "Failed to get notifications" }
    }
}

export async function markAsRead(notificationId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        await prisma.notification.update({
            where: { id: notificationId, userId: session.user.id },
            data: { read: true }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Failed to mark notification as read:", error)
        return { success: false, error: "Failed to mark as read" }
    }
}

export async function markAllAsRead() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, read: false },
            data: { read: true }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Failed to mark all as read:", error)
        return { success: false, error: "Failed to mark all as read" }
    }
}

export async function createNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    link?: string
}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link
            }
        })
        return { success: true, data: notification }
    } catch (error) {
        console.error("Failed to create notification:", error)
        return { success: false, error: "Failed to create notification" }
    }
}

export async function deleteNotification(notificationId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" }
    }

    try {
        await prisma.notification.delete({
            where: { id: notificationId, userId: session.user.id }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete notification:", error)
        return { success: false, error: "Failed to delete notification" }
    }
}
