"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    const tabs = [
        { name: "User Management", href: "/dashboard/admin/users" },
        { name: "System Settings", href: "/dashboard/admin/settings" },
        { name: "Performance", href: "/dashboard/admin/performance" },
        { name: "Activity Logs", href: "/dashboard/admin/audit" },
    ]

    function handleAddUser() {
        router.push("/dashboard/admin/users?action=new")
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Admin Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Control Panel</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage users, system settings, and monitor performance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        onClick={handleAddUser}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                    <NotificationDropdown />
                </div>
            </div>

            {/* Tabbed Navigation */}
            <div className="border-b">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                                )}
                            >
                                {tab.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Page Content */}
            <div className="min-h-[500px]">
                {children}
            </div>
        </div>
    )
}
