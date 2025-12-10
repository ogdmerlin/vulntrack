'use client'

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Calendar } from "lucide-react"

export default function ProfilePage() {
    const { data: session } = useSession()

    const userInitials = session?.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : session?.user?.email?.substring(0, 2).toUpperCase() || 'U'

    const joinedDate = new Date(2024, 0, 1).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">
                    Manage your account information and preferences
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information Card */}
                <Card>
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Your personal account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-4 md:p-6 pt-0 md:pt-0">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="" alt="User" />
                                <AvatarFallback className="text-2xl">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <Button variant="outline" size="sm">
                                    Change Avatar
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG or GIF. Max 2MB
                                </p>
                            </div>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                defaultValue={session?.user?.name || ""}
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={session?.user?.email || ""}
                                placeholder="Enter your email"
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed
                            </p>
                        </div>

                        <Button className="w-full">Save Changes</Button>
                    </CardContent>
                </Card>

                {/* Account Details Card */}
                <Card>
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>
                            Information about your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                        <div className="flex items-center justify-between py-3 border-b">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Role</p>
                                    <p className="text-sm text-muted-foreground">
                                        {session?.user?.role === 'admin' ? 'Administrator' : 'User'}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${session?.user?.role === 'admin'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                {session?.user?.role === 'admin' ? 'Admin' : 'User'}
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Member Since</p>
                                    <p className="text-sm text-muted-foreground">
                                        {joinedDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Email Status</p>
                                    <p className="text-sm text-muted-foreground">
                                        Verified
                                    </p>
                                </div>
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-500">
                                ✓ Verified
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card>
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle>Security</CardTitle>
                        <CardDescription>
                            Manage your password and security settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>
                        <Button variant="outline" className="w-full">
                            Update Password
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone Card */}
                <Card className="border-destructive/50">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible actions for your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                        <div className="rounded-lg border border-destructive/50 p-4 space-y-3">
                            <div>
                                <h4 className="font-medium">Delete Account</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Once you delete your account, there is no going back. This will permanently delete all your data.
                                </p>
                            </div>
                            <Button variant="destructive" size="sm">
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
