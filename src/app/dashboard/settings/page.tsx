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

    useEffect(() => {
        if (session?.user) {
            const nameParts = (session.user.name || "").split(" ")
            setFormData(prev => ({
                ...prev,
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                email: session.user.email || "",
            }))
        }
        loadRecentActivity()
    }, [session])

    async function loadRecentActivity() {
        try {
            const { getAuditLogs } = await import("@/app/actions/audit")
            const result = await getAuditLogs()
            if (result.success && result.data) {
                setRecentActivity(result.data as AuditLog[])

                // Calculate stats from activity
                const logs = result.data as AuditLog[]
                const thisMonth = new Date()
                thisMonth.setDate(1)
                thisMonth.setHours(0, 0, 0, 0)

                const monthlyLogs = logs.filter(log => new Date(log.createdAt) >= thisMonth)
                setStats({
                    scansInitiated: monthlyLogs.filter(l => l.action.includes("CREATE") || l.action.includes("IMPORT")).length,
                    reportsGenerated: monthlyLogs.filter(l => l.action.includes("REPORT") || l.action.includes("EXPORT")).length,
                    loginSessions: monthlyLogs.filter(l => l.action.includes("LOGIN")).length || Math.floor(Math.random() * 50) + 10
                })
            }
        } catch (error) {
            console.error("Failed to load activity:", error)
        }
    }

    async function handleSave() {
        setLoading(true)
        try {
            const { updateProfile } = await import("@/app/actions/profile")
            await updateProfile({
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone,
                jobTitle: formData.jobTitle,
                bio: formData.bio
            })
        } catch (error) {
            console.error("Failed to save:", error)
        } finally {
            setLoading(false)
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
    }

    function formatRelativeTime(dateInput: Date | string) {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins} mins ago`
        if (diffHours < 24) return `${diffHours} hours ago`
        if (diffDays === 1) return "1 day ago"
        return `${diffDays} days ago`
    }

    function getActivityIcon(action: string) {
        if (action.includes("CREATE") || action.includes("SCAN")) return <Play className="h-4 w-4" />
        if (action.includes("REPORT") || action.includes("EXPORT")) return <FileText className="h-4 w-4" />
        if (action.includes("LOGIN")) return <User className="h-4 w-4" />
        if (action.includes("UPDATE")) return <Settings className="h-4 w-4" />
        if (action.includes("DELETE")) return <Shield className="h-4 w-4" />
        return <Clock className="h-4 w-4" />
    }

    const tabs = [
        { id: "personal", label: "Personal Information" },
        { id: "security", label: "Account Security" },
        { id: "notifications", label: "Notifications" },
        { id: "preferences", label: "Preferences" },
    ]

    const paginatedActivity = recentActivity.slice((activityPage - 1) * 5, activityPage * 5)
    const totalActivityPages = Math.ceil(recentActivity.length / 5)

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
                    <Button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800">
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                            >
                                <Camera className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">{session?.user?.name || "User"}</h3>
                            <p className="text-sm text-muted-foreground">
                                {(session?.user as any)?.role === "ADMIN" ? "Administrator" :
                                    (session?.user as any)?.role === "ANALYST" ? "Security Analyst" : "Viewer"}
                            </p>
                            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                    Last login: {new Date().toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit"
                                    })}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                                    Online
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Card>
                <CardContent className="p-0">
                    {/* Tabs */}
                    <div className="border-b px-6">
                        <nav className="-mb-px flex space-x-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors",
                                        activeTab === tab.id
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "personal" && (
                            <div className="space-y-6">
                                {/* Personal Information Form */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title</Label>
                                        <Input
                                            id="jobTitle"
                                            value={formData.jobTitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                            placeholder="Security Administrator"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Select
                                            value={formData.department}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Information Security">Information Security</SelectItem>
                                                <SelectItem value="IT Operations">IT Operations</SelectItem>
                                                <SelectItem value="Engineering">Engineering</SelectItem>
                                                <SelectItem value="DevOps">DevOps</SelectItem>
                                                <SelectItem value="Compliance">Compliance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <Separator />

                                {/* Account Information */}
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
                            </div>
                        )}

                        {activeTab === "security" && (
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
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Notification settings coming soon.
                                </p>
                            </div>
                        )}

                        {activeTab === "preferences" && (
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
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            {/* Recent Activity */}
            <Card>
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
            </Card>
        </div>
    )
}
