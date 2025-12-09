'use client'

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Save,
    Bell,
    Camera,
    Play,
    FileText,
    Clock,
    ChevronLeft,
    ChevronRight,
    Shield,
    User,
    Settings,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditLog {
    id: string
    action: string
    entityType: string
    entityId: string | null
    details: string | null
    createdAt: Date
}

export default function SettingsPage() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState("personal")
    const [loading, setLoading] = useState(false)
    const [recentActivity, setRecentActivity] = useState<AuditLog[]>([])
    const [activityPage, setActivityPage] = useState(1)
    const [stats, setStats] = useState({
        scansInitiated: 0,
        reportsGenerated: 0,
        loginSessions: 0
    })

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
        department: "Information Security",
        bio: ""
    })

    async function loadProfile() {
        try {
            const { getProfile } = await import("@/app/actions/profile")
            const result = await getProfile()
            if (result.success && result.data) {
                const user = result.data as any
                const nameParts = (user.name || "").split(" ")
                setFormData({
                    firstName: nameParts[0] || "",
                    lastName: nameParts.slice(1).join(" ") || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    jobTitle: user.jobTitle || "",
                    department: user.department || "Information Security",
                    bio: user.bio || ""
                })
            }
        } catch (error) {
            console.error("Failed to load profile:", error)
        }
    }

    useEffect(() => {
        loadProfile()
        loadRecentActivity()
    }, [session])

    // ... (rest of functions)

    async function handleSave() {
        setLoading(true)
        try {
            const { updateProfile } = await import("@/app/actions/profile")
            await updateProfile({
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone,
                jobTitle: formData.jobTitle,
                department: formData.department,
                bio: formData.bio
            })
            // Refresh profile data to confirm save
            await loadProfile()
            // Optional: Show toast
        } catch (error) {
            console.error("Failed to save:", error)
        } finally {
            setLoading(false)
        }
    }

    // ...

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your personal information and account preferences
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* ... Profile Header Card ... */}

            {/* Tabbed Content */}
            <Card>
                <CardContent className="p-0">
                    {/* ... Tabs ... */}

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "personal" && (
                            <div className="space-y-6">
                                {/* Personal Information Form */}
                                {/* ... inputs ... */}

                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800 min-w-[150px]">
                                        {loading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save Changes
                                    </Button>
                                </div>

                                <Separator />

                                {/* ... Account Info ... */}
                            </div>
                        )}
                        {/* ... other tabs ... */}
                    </div>
                </CardContent>
            </Card>

            {/* ... Stats ... */}
        </div>
    )

    {/* Account Information */ }
    <div>
        <h4 className="font-semibold mb-4">Account Information</h4>
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                    value={`UID_${(session?.user as any)?.id?.slice(-5).toUpperCase() || "12345"}`}
                    disabled
                    className="bg-muted font-mono"
                />
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <Input
                    value={(session?.user as any)?.role === "ADMIN" ? "Administrator" :
                        (session?.user as any)?.role === "ANALYST" ? "Analyst" : "Viewer"}
                    disabled
                    className="bg-muted"
                />
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="space-y-2">
                <Label>Account Created</Label>
                <Input
                    value={formatDate(new Date().toISOString())}
                    disabled
                    className="bg-muted"
                />
            </div>
            <div className="space-y-2">
                <Label>Last Updated</Label>
                <Input
                    value={formatDate(new Date().toISOString())}
                    disabled
                    className="bg-muted"
                />
            </div>
        </div>
    </div>
                            </div >
                        )
}

{
    activeTab === "security" && (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                </div>
            </div>
            <Button>Update Password</Button>
        </div>
    )
}

{
    activeTab === "notifications" && (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Notification settings coming soon.
            </p>
        </div>
    )
}

{
    activeTab === "preferences" && (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center gap-2">
                    <div className="h-20 w-32 rounded-md bg-slate-950 border-2 border-primary flex items-center justify-center text-xs text-white">
                        Dark (Active)
                    </div>
                    <div className="h-20 w-32 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-900 opacity-50 cursor-not-allowed">
                        Light (Soon)
                    </div>
                </div>
            </div>
        </div>
    )
}
                    </div >
                </CardContent >
            </Card >

    {/* Stats Cards */ }
    < div className = "grid gap-4 md:grid-cols-3" >
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Scans Initiated</p>
                            <h3 className="text-2xl font-bold">{stats.scansInitiated}</h3>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Play className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Reports Generated</p>
                            <h3 className="text-2xl font-bold">{stats.reportsGenerated}</h3>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Login Sessions</p>
                            <h3 className="text-2xl font-bold">{stats.loginSessions}</h3>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div >

    {/* Recent Activity */ }
    < Card >
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {paginatedActivity.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No recent activity found.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {paginatedActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        {getActivityIcon(activity.action)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {activity.details || `${activity.action.replace(/_/g, " ").toLowerCase()}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {activity.entityType} • {formatRelativeTime(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {recentActivity.length > 5 && (
                        <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                disabled={activityPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {activityPage} / {totalActivityPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setActivityPage(p => Math.min(totalActivityPages, p + 1))}
                                disabled={activityPage === totalActivityPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card >
        </div >
    )
}
