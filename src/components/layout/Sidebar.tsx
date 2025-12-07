'use client'

import Link from "next/link"
import { LayoutDashboard, ShieldAlert, Settings, LogOut, AlertTriangle, Shield, FileText, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Vulnerabilities",
        href: "/dashboard/vulnerabilities",
        icon: ShieldAlert,
    },
    {
        title: "Misconfigurations",
        href: "/dashboard/misconfigurations",
        icon: AlertTriangle,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        title: "User Management",
        href: "/dashboard/admin/users",
        icon: Shield,
    },
    {
        title: "Audit Logs",
        href: "/dashboard/admin/audit",
        icon: FileText,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart, // We need to import BarChart
    },
]

export function Sidebar() {
    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                    <span>VulnTrack</span>
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="border-t p-4">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
