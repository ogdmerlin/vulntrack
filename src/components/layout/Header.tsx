'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { NotificationDropdown } from "./NotificationDropdown"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "./Sidebar"

export function Header() {
    const { data: session } = useSession()
    const router = useRouter()
    const userInitials = session?.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : session?.user?.email?.substring(0, 2).toUpperCase() || 'U'

    return (
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
                <NotificationDropdown />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <Avatar>
                                <AvatarImage src="" alt="User" />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push('/dashboard/profile')}
                        >
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push('/dashboard/settings')}
                        >
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive cursor-pointer"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
