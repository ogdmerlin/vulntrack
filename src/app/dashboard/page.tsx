import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ShieldAlert,
    ShieldCheck,
    Activity,
    Users,
    Play,
    FileText,
    UserCog,
    Settings,
    ChevronLeft,
    ChevronRight,
    ExternalLink
} from "lucide-react"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { getVulnerabilities } from "@/app/actions/vulnerabilities"
import { getUsers } from "@/app/actions/admin"
import Link from "next/link"
import { encodeId } from "@/lib/id-encoder"

export default async function DashboardPage() {
    // Fetch real data
    const vulnResult = await getVulnerabilities()
    const vulnerabilities = vulnResult.data || []

    // Calculate stats
    const totalVulns = vulnerabilities.length
    const criticalCount = vulnerabilities.filter((v: any) => v.severity === "CRITICAL").length
    const resolvedCount = vulnerabilities.filter((v: any) =>
        v.status === "RESOLVED" || v.status === "CLOSED"
    ).length

    // Get recent vulnerabilities (sorted by date, take first 5)
    const recentVulns = [...vulnerabilities]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

    // Try to get user count (may fail if not admin)
    let userCount = 0
    let userCountAuthorized = false
    try {
        const userResult = await getUsers()
        if (userResult.success && userResult.data) {
            userCount = userResult.data.length
            userCountAuthorized = true
        }
    } catch {
        // Keep default count if not authorized
    }

    function formatRelativeTime(dateString: string) {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffHours < 1) return "Just now"
        if (diffHours < 24) return `${diffHours} hours ago`
        if (diffDays === 1) return "1 day ago"
        return `${diffDays} days ago`
    }

    function getSeverityColor(severity: string) {
        switch (severity) {
            case "CRITICAL": return "bg-red-100 text-red-700 border-red-200"
            case "HIGH": return "bg-orange-100 text-orange-700 border-orange-200"
            case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200"
            case "LOW": return "bg-blue-100 text-blue-700 border-blue-200"
            default: return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Vulnerabilities
                        </CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVulns}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all assets
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Critical Issues
                        </CardTitle>
                        <Activity className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires immediate attention
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Remediated
                        </CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resolvedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Issues resolved
                        </p>
                    </CardContent>
                </Card>
                {userCountAuthorized && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Security team members
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Trend Chart */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <TrendChart />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Risks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {vulnerabilities
                                .filter((v: any) => v.severity === "CRITICAL" || v.severity === "HIGH")
                                .slice(0, 3)
                                .map((vuln: any) => (
                                    <div key={vuln.id} className="flex items-center">
                                        <div className="ml-4 space-y-1 flex-1">
                                            <Link
                                                href={`/dashboard/vulnerabilities/${encodeId(vuln.id)}`}
                                                className="text-sm font-medium leading-none hover:underline"
                                            >
                                                {vuln.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                {vuln.severity} {vuln.dread ? `• DREAD: ${vuln.dread.total}` : ""}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={getSeverityColor(vuln.severity)}>
                                            {vuln.severity}
                                        </Badge>
                                    </div>
                                ))}
                            {vulnerabilities.filter((v: any) => v.severity === "CRITICAL" || v.severity === "HIGH").length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No critical or high risks found
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Vulnerabilities & Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Vulnerabilities */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Vulnerabilities</CardTitle>
                        <Link href="/dashboard/vulnerabilities">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                View all
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {recentVulns.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No vulnerabilities found.
                                    <Link href="/dashboard/vulnerabilities/new" className="text-primary hover:underline ml-1">
                                        Add your first vulnerability
                                    </Link>
                                </p>
                            ) : (
                                recentVulns.map((vuln: any) => (
                                    <div
                                        key={vuln.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${vuln.severity === "CRITICAL" ? "bg-red-500" :
                                                vuln.severity === "HIGH" ? "bg-orange-500" :
                                                    vuln.severity === "MEDIUM" ? "bg-yellow-500" :
                                                        "bg-blue-500"
                                                }`} />
                                            <div>
                                                <Link
                                                    href={`/dashboard/vulnerabilities/${encodeId(vuln.id)}`}
                                                    className="font-medium text-sm hover:underline"
                                                >
                                                    {vuln.title}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {vuln.asset || "System Asset"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant="outline"
                                                className={`${getSeverityColor(vuln.severity)} text-xs`}
                                            >
                                                {vuln.severity}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatRelativeTime(vuln.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>


                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">

                        <Link href="/dashboard/reports">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12">
                                <FileText className="h-4 w-4" />
                                Export Report
                            </Button>
                        </Link>
                        <Link href="/dashboard/admin/users">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12">
                                <UserCog className="h-4 w-4" />
                                Manage Users
                            </Button>
                        </Link>
                        <Link href="/dashboard/settings">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12">
                                <Settings className="h-4 w-4" />
                                System Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
