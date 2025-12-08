'use client'

import { useEffect, useState, useTransition } from "react"
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/app/actions/notifications"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    link?: string | null
    createdAt: Date | string
}

export function NotificationDropdown() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        loadNotifications()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    async function loadNotifications() {
        const result = await getNotifications()
        if (result.success && result.data) {
            setNotifications(result.data.notifications)
            setUnreadCount(result.data.unreadCount)
        }
    }

    async function handleMarkAsRead(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        startTransition(async () => {
            await markAsRead(id)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        })
    }

    async function handleMarkAllAsRead() {
        startTransition(async () => {
            await markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        })
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        startTransition(async () => {
            await deleteNotification(id)
            const notification = notifications.find(n => n.id === id)
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        })
    }

    function handleNotificationClick(notification: Notification) {
        if (!notification.read) {
            markAsRead(notification.id)
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
        if (notification.link) {
            router.push(notification.link)
            setIsOpen(false)
        }
    }

    function getTimeAgo(dateString: string) {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllAsRead}
                            disabled={isPending}
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No notifications yet
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                    !notification.read && "bg-muted/50"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {!notification.read && (
                                                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                            )}
                                            <span className="font-medium text-sm truncate">
                                                {notification.title}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground mt-1">
                                            {getTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {notification.link && (
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => handleDelete(notification.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
