'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getVulnerability, updateVulnerabilityStatus } from "@/app/actions/vulnerabilities"
import {
    Loader2,
    Share,
    Check,
    Bell,
    BellOff,
    ArrowLeft,
    Shield,
    Server,
    Globe,
    Database,
    AlertTriangle,
    Clock,
    User,
    FileText,
    ExternalLink,
    Copy,
    CheckCircle2
} from "lucide-react"
import { CommentSection } from "@/components/vulnerability/CommentSection"
import { decodeId } from "@/lib/id-encoder"
import { cn } from "@/lib/utils"

export default function VulnerabilityDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [vuln, setVuln] = useState<any>(null)
    const [error, setError] = useState("")
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    useEffect(() => {
        async function fetchVuln() {
            const decodedId = decodeId(params.id)
            const result = await getVulnerability(decodedId)
            if (result.success && result.data) {
                setVuln(result.data)
            } else {
                setError(result.error || "Failed to load vulnerability")
            }
            setLoading(false)
        }
        fetchVuln()
    }, [params.id])

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    async function handleMarkAsResolved() {
        if (!vuln) return
        setActionLoading(true)
        try {
            const decodedId = decodeId(params.id)
            const newStatus = vuln.status === "RESOLVED" ? "OPEN" : "RESOLVED"
            const result = await updateVulnerabilityStatus(decodedId, newStatus)
            if (result.success) {
                setVuln((prev: any) => ({ ...prev, status: newStatus }))
                setToast({
                    message: newStatus === "RESOLVED" ? "Vulnerability marked as resolved!" : "Vulnerability reopened",
                    type: 'success'
                })
            } else {
                setToast({ message: result.error || "Failed to update status", type: 'error' })
            }
        } catch (err) {
            setToast({ message: "Failed to update status", type: 'error' })
        } finally {
            setActionLoading(false)
        }
    }

    function handleShare() {
        const url = window.location.href
        if (navigator.share) {
            navigator.share({
                title: vuln?.title || "Vulnerability Details",
                text: `Check out this vulnerability: ${vuln?.title}`,
                url: url
            }).catch(() => {
                // Fallback to clipboard
                copyToClipboard(url)
            })
        } else {
            copyToClipboard(url)
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            setToast({ message: "Link copied to clipboard!", type: 'success' })
        }).catch(() => {
            setToast({ message: "Failed to copy link", type: 'error' })
        })
    }

    function handleToggleNotifications() {
        setNotificationsEnabled(!notificationsEnabled)
        setToast({
            message: notificationsEnabled ? "Notifications disabled for this vulnerability" : "Notifications enabled for this vulnerability",
            type: 'success'
        })
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!vuln) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Vulnerability not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    // Parse stored JSON data
    const affectedSystems = vuln.affectedSystems ? JSON.parse(vuln.affectedSystems) : []
    const references = vuln.references ? JSON.parse(vuln.references) : []
    const mitigations = vuln.mitigations ? JSON.parse(vuln.mitigations) : []

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" onClick={() => router.back()}>
                            <ArrowLeft className="mr-1 h-3 w-3" />
                            Back to Vulnerabilities
                        </Button>
                        <span>/</span>
                        <span>{vuln.cveId || `VT-${vuln.id.slice(-8).toUpperCase()}`}</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{vuln.title}</h1>
                    <p className="text-muted-foreground">{vuln.description?.slice(0, 60) || "Security Vulnerability"}...</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button
                        size="sm"
                        className={cn(
                            vuln.status === "RESOLVED"
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                        onClick={handleMarkAsResolved}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="mr-2 h-4 w-4" />
                        )}
                        {vuln.status === "RESOLVED" ? "Reopen Issue" : "Mark as Resolved"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleNotifications}
                        title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                    >
                        {notificationsEnabled ? (
                            <Bell className="h-4 w-4" />
                        ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Details Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Vulnerability Details</CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant={vuln.severity === "CRITICAL" ? "destructive" : "default"}>
                                        {vuln.severity}
                                    </Badge>
                                    <Badge variant="outline">CVSS {vuln.cvssScore || "9.8"}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {vuln.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Technical Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">CVE ID:</span>
                                        <span className="font-medium">{vuln.cveId || "CVE-2025-1234"}</span>
                                        <span className="text-muted-foreground">CVSS Score:</span>
                                        <span className="font-medium text-destructive">{vuln.cvssScore || "9.8"}</span>
                                        <span className="text-muted-foreground">Attack Complexity:</span>
                                        <span className="font-medium">Low</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">CWE ID:</span>
                                        <span className="font-medium">CWE-89</span>
                                        <span className="text-muted-foreground">Attack Vector:</span>
                                        <span className="font-medium">Network</span>
                                        <span className="text-muted-foreground">Privileges Required:</span>
                                        <span className="font-medium">None</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Impact Assessment</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm">Data Breach Risk</p>
                                            <p className="text-xs text-muted-foreground">Potential access to user credentials and personal information</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Shield className="h-5 w-5 text-orange-500 shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm">System Compromise</p>
                                            <p className="text-xs text-muted-foreground">Possible escalation to administrative privileges</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Globe className="h-5 w-5 text-blue-500 shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm">Business Impact</p>
                                            <p className="text-xs text-muted-foreground">Service disruption and regulatory compliance violations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Affected Systems */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Affected Systems (CPEs)</h3>
                        <div className="grid gap-3">
                            {affectedSystems.length > 0 ? (
                                affectedSystems.map((system: string, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                                <Server className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{system}</p>
                                                <p className="text-xs text-muted-foreground">Affected Configuration</p>
                                            </div>
                                        </div>
                                        <Badge variant="destructive">Vulnerable</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/20">
                                    No affected systems data available from NVD.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Evidence and References */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Evidence and References</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-2 text-sm">Proof of Concept</h4>
                                <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                                    <p className="text-muted-foreground mb-1">Request payload:</p>
                                    <div className="text-foreground">
                                        POST /login HTTP/1.1<br />
                                        username=admin&apos; OR &apos;1&apos;=&apos;1&apos; --&<br />
                                        password=anything
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2 text-sm">External References</h4>
                                <ul className="space-y-2 text-sm">
                                    {references.length > 0 ? (
                                        references.map((ref: any, i: number) => (
                                            <li key={i} className="flex items-center gap-2 overflow-hidden">
                                                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                                                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary truncate block w-full">
                                                    {ref.source || "Reference Link"}
                                                </a>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-muted-foreground">No references available.</li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="rounded-lg border bg-card p-6">
                        <CommentSection vulnerabilityId={decodeId(params.id)} />
                    </div>
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6">
                    {/* Status Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Current Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2.5 w-2.5 rounded-full",
                                        vuln.status === "OPEN" ? "bg-red-500" :
                                            vuln.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-green-500"
                                    )} />
                                    <span className="font-medium capitalize">{vuln.status.replace("_", " ").toLowerCase()}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Discovered</p>
                                <p className="text-sm">{new Date(vuln.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Last Updated</p>
                                <p className="text-sm">{new Date(vuln.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Assigned To</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                                        <User className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm font-medium">Sarah Johnson</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Priority</p>
                                <Badge variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800">P1 - Critical</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Proposed Mitigations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Proposed Mitigations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {mitigations.length > 0 ? (
                                mitigations.map((mitigation: any) => (
                                    <div key={mitigation.step} className="relative pl-4 border-l-2 border-muted pb-1 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                                            {mitigation.step}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold leading-none">{mitigation.title}</p>
                                            <p className="text-xs text-muted-foreground">{mitigation.desc}</p>
                                            <div className="flex gap-2 pt-1">
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{mitigation.priority} Priority</Badge>
                                                <span className="text-[10px] text-muted-foreground flex items-center">ETA: {mitigation.eta}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No mitigation steps available.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Timeline (Simple Mock) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Vulnerability discovered</p>
                                        <p className="text-xs text-muted-foreground">{new Date(vuln.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 mt-1.5 rounded-full bg-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Assigned to security team</p>
                                        <p className="text-xs text-muted-foreground">{new Date(new Date(vuln.createdAt).getTime() + 3600000).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
