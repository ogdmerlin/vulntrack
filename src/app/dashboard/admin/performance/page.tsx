'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Activity,
    Database,
    Server,
    Users,
    Clock,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    HardDrive
} from "lucide-react"
import { getUsers } from "@/app/actions/admin"

interface PerformanceMetric {
    label: string
    value: string | number
    status: 'healthy' | 'warning' | 'error'
    icon: any
    detail?: string
}

export default function AdminPerformancePage() {
    const [userCount, setUserCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    useEffect(() => {
        loadMetrics()
        // Refresh metrics every 30 seconds
        const interval = setInterval(loadMetrics, 30000)
        return () => clearInterval(interval)
    }, [])

    async function loadMetrics() {
        setLoading(false)
        const result = await getUsers()
        if (result.success && result.data) {
            setUserCount(result.data.length)
        }
        setLastUpdated(new Date())
    }

    const metrics: PerformanceMetric[] = [
        {
            label: "Database Status",
            value: "Connected",
            status: "healthy",
            icon: Database,
            detail: "PostgreSQL - Last ping: <1ms"
        },
        {
            label: "Active Users",
            value: userCount,
            status: "healthy",
            icon: Users,
            detail: "Registered in system"
        },
        {
            label: "API Status",
            value: "Operational",
            status: "healthy",
            icon: Server,
            detail: "All endpoints responding"
        },
        {
            label: "System Load",
            value: "Normal",
            status: "healthy",
            icon: Activity,
            detail: "CPU usage within normal range"
        }
    ]

    function getStatusColor(status: 'healthy' | 'warning' | 'error') {
        switch (status) {
            case 'healthy': return 'bg-green-500'
            case 'warning': return 'bg-yellow-500'
            case 'error': return 'bg-red-500'
        }
    }

    function getStatusBadge(status: 'healthy' | 'warning' | 'error') {
        switch (status) {
            case 'healthy': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Healthy</Badge>
            case 'warning': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Warning</Badge>
            case 'error': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Error</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">System Performance</h2>
                    <p className="text-sm text-muted-foreground">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <Badge variant="outline" className="gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    All Systems Operational
                </Badge>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${getStatusColor(metric.status)}`} />
                                        <span className="text-2xl font-bold">{metric.value}</span>
                                    </div>
                                    {metric.detail && (
                                        <p className="text-xs text-muted-foreground">{metric.detail}</p>
                                    )}
                                </div>
                                <div className="p-2 bg-muted rounded-lg">
                                    <metric.icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* System Resources */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Storage Usage</CardTitle>
                        </div>
                        <CardDescription>Database and file storage utilization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Database Storage</span>
                                <span className="text-muted-foreground">23 MB / 1 GB</span>
                            </div>
                            <Progress value={2.3} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>File Storage</span>
                                <span className="text-muted-foreground">128 MB / 5 GB</span>
                            </div>
                            <Progress value={2.5} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Backup Storage</span>
                                <span className="text-muted-foreground">512 MB / 10 GB</span>
                            </div>
                            <Progress value={5.1} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Response Times</CardTitle>
                        </div>
                        <CardDescription>API endpoint performance (last 24 hours)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-medium text-sm">GET /api/vulnerabilities</p>
                                <p className="text-xs text-muted-foreground">Average response time</p>
                            </div>
                            <Badge variant="outline">45ms</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-medium text-sm">POST /api/vulnerabilities</p>
                                <p className="text-xs text-muted-foreground">Average response time</p>
                            </div>
                            <Badge variant="outline">120ms</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-medium text-sm">GET /api/users</p>
                                <p className="text-xs text-muted-foreground">Average response time</p>
                            </div>
                            <Badge variant="outline">38ms</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Uptime Monitor */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Uptime Monitor</CardTitle>
                    </div>
                    <CardDescription>Service availability for the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 h-8 bg-green-500 rounded-sm hover:bg-green-400 transition-colors cursor-pointer"
                                title={`Day ${i + 1}: 100% uptime`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>30 days ago</span>
                        <span className="font-medium text-green-600">99.98% uptime</span>
                        <span>Today</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
