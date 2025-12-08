"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Plus,
    Import,
    Bug,
    AlertTriangle,
    FolderOpen,
    CheckCircle2,
    Eye,
    ExternalLink,
    MoreVertical,
    Pencil,
    Trash2,
    Copy,
    CheckCircle,
    XCircle,
    Clock,
    Loader2
} from "lucide-react"
import { encodeId } from "@/lib/id-encoder"

interface Vulnerability {
    id: string
    title: string
    description: string
    status: string
    severity: string
    cveId?: string
    asset?: string
    createdAt: Date
    dread?: { total: number } | null
    approvalStatus?: string
}

export default function VulnerabilitiesPage() {
    const router = useRouter()
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState("severity")
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [vulnToDelete, setVulnToDelete] = useState<Vulnerability | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const itemsPerPage = 10

    useEffect(() => {
        loadVulnerabilities()
    }, [])

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    async function loadVulnerabilities() {
        try {
            const { getVulnerabilities } = await import("@/app/actions/vulnerabilities")
            const result = await getVulnerabilities()
            if (result.data) {
                setVulnerabilities(result.data as any[])
            }
            if (result.error) {
                setError(result.error)
            }
        } catch (err) {
            setError("Failed to load vulnerabilities")
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusChange(vuln: Vulnerability, newStatus: string) {
        setActionLoading(vuln.id)
        try {
            const { updateVulnerabilityStatus } = await import("@/app/actions/vulnerabilities")
            const result = await updateVulnerabilityStatus(vuln.id, newStatus)
            if (result.success) {
                setVulnerabilities(prev => prev.map(v =>
                    v.id === vuln.id ? { ...v, status: newStatus } : v
                ))
                setToast({ message: `Status updated to ${newStatus}`, type: 'success' })
            } else {
                setToast({ message: result.error || 'Failed to update status', type: 'error' })
            }
        } catch (err) {
            setToast({ message: 'Failed to update status', type: 'error' })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleDelete() {
        if (!vulnToDelete) return
        setActionLoading(vulnToDelete.id)
        try {
            const { deleteVulnerability } = await import("@/app/actions/vulnerabilities")
            const result = await deleteVulnerability(vulnToDelete.id)
            if (result.success) {
                setVulnerabilities(prev => prev.filter(v => v.id !== vulnToDelete.id))
                setToast({ message: 'Vulnerability deleted successfully', type: 'success' })
            } else {
                setToast({ message: result.error || 'Failed to delete', type: 'error' })
            }
        } catch (err) {
            setToast({ message: 'Failed to delete vulnerability', type: 'error' })
        } finally {
            setActionLoading(null)
            setDeleteDialogOpen(false)
            setVulnToDelete(null)
        }
    }

    function handleCopyId(id: string) {
        navigator.clipboard.writeText(id)
        setToast({ message: 'ID copied to clipboard', type: 'success' })
    }

    function handleEdit(vuln: Vulnerability) {
        router.push(`/dashboard/vulnerabilities/${encodeId(vuln.id)}?edit=true`)
    }

    function handleView(vuln: Vulnerability) {
        router.push(`/dashboard/vulnerabilities/${encodeId(vuln.id)}`)
    }

    function confirmDelete(vuln: Vulnerability) {
        setVulnToDelete(vuln)
        setDeleteDialogOpen(true)
    }

    // Calculate summary stats
    const totalCount = vulnerabilities.length
    const criticalCount = vulnerabilities.filter(v => v.severity === "CRITICAL").length
    const openCount = vulnerabilities.filter(v => v.status === "OPEN").length
    const resolvedCount = vulnerabilities.filter(v => v.status === "RESOLVED" || v.status === "CLOSED").length

    // Sort vulnerabilities
    const sortedVulnerabilities = [...vulnerabilities].sort((a, b) => {
        if (sortBy === "severity") {
            const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
            return (order[a.severity as keyof typeof order] || 4) - (order[b.severity as keyof typeof order] || 4)
        }
        if (sortBy === "status") {
            return a.status.localeCompare(b.status)
        }
        if (sortBy === "date") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return 0
    })

    // Pagination
    const totalPages = Math.ceil(sortedVulnerabilities.length / itemsPerPage)
    const paginatedVulnerabilities = sortedVulnerabilities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Helper functions
    function getSeverityBadge(severity: string) {
        const styles: Record<string, string> = {
            CRITICAL: "bg-red-600 text-white hover:bg-red-700",
            HIGH: "bg-orange-500 text-white hover:bg-orange-600",
            MEDIUM: "bg-yellow-500 text-white hover:bg-yellow-600",
            LOW: "bg-blue-500 text-white hover:bg-blue-600",
        }
        return styles[severity] || "bg-gray-500 text-white"
    }

    function getStatusBadge(status: string) {
        if (status === "OPEN") return "border-red-200 text-red-700 bg-red-50"
        if (status === "IN_PROGRESS") return "border-yellow-200 text-yellow-700 bg-yellow-50"
        if (status === "RESOLVED" || status === "CLOSED") return "border-green-200 text-green-700 bg-green-50"
        return "border-gray-200 text-gray-700 bg-gray-50"
    }

    function formatDate(dateInput: Date | string) {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffHours < 1) return "Just now"
        if (diffHours < 24) return `${diffHours} hours ago`
        if (diffDays === 1) return "1 day ago"
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    function getSeverityIcon(severity: string) {
        if (severity === "CRITICAL" || severity === "HIGH") {
            return <AlertTriangle className="h-4 w-4 text-orange-500" />
        }
        return <Bug className="h-4 w-4 text-blue-500" />
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.message}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vulnerability</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{vulnToDelete?.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Vulnerabilities</h2>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/vulnerabilities/import">
                        <Button variant="outline">
                            <Import className="mr-2 h-4 w-4" />
                            Import CVE
                        </Button>
                    </Link>
                    <Link href="/dashboard/vulnerabilities/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Vulnerability
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <h3 className="text-2xl font-bold">{totalCount}</h3>
                        </div>
                        <Bug className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card className="border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Critical</p>
                            <h3 className="text-2xl font-bold">{criticalCount}</h3>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </CardContent>
                </Card>
                <Card className="border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Open</p>
                            <h3 className="text-2xl font-bold">{openCount}</h3>
                        </div>
                        <FolderOpen className="h-5 w-5 text-yellow-500" />
                    </CardContent>
                </Card>
                <Card className="border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Resolved</p>
                            <h3 className="text-2xl font-bold">{resolvedCount}</h3>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </CardContent>
                </Card>
            </div>

            {/* Table Section */}
            <Card className="border">
                <div className="p-4 flex items-center justify-between border-b">
                    <h3 className="font-semibold">All Vulnerabilities</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="severity">Severity</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px]">
                                <Checkbox />
                            </TableHead>
                            <TableHead className="w-[300px]">VULNERABILITY</TableHead>
                            <TableHead>SEVERITY</TableHead>
                            <TableHead>ASSET</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>FOUND</TableHead>
                            <TableHead className="text-right">ACTIONS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedVulnerabilities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No vulnerabilities found.{" "}
                                    <Link href="/dashboard/vulnerabilities/new" className="text-primary hover:underline">
                                        Add your first vulnerability
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedVulnerabilities.map((vuln) => (
                                <TableRow key={vuln.id} className="group hover:bg-muted/50">
                                    <TableCell>
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-start gap-2">
                                            {getSeverityIcon(vuln.severity)}
                                            <div>
                                                <button
                                                    onClick={() => handleView(vuln)}
                                                    className="font-medium hover:underline text-left"
                                                >
                                                    {vuln.title}
                                                </button>
                                                <p className="text-xs text-muted-foreground">
                                                    {vuln.cveId || `VT-${vuln.id.slice(-8).toUpperCase()}`}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${getSeverityBadge(vuln.severity)} rounded-full px-3`}>
                                            {vuln.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {vuln.asset || "System Asset"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Web Application
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`${getStatusBadge(vuln.status)} rounded-full`}
                                        >
                                            {vuln.status === "IN_PROGRESS" ? "In Progress" :
                                                vuln.status.charAt(0) + vuln.status.slice(1).toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm">{formatDate(vuln.createdAt)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(vuln.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {actionLoading === vuln.id && (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleView(vuln)}
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(vuln)}
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleView(vuln)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(vuln)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleCopyId(vuln.id)}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copy ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {vuln.status !== "OPEN" && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(vuln, "OPEN")}>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Mark as Open
                                                        </DropdownMenuItem>
                                                    )}
                                                    {vuln.status !== "IN_PROGRESS" && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(vuln, "IN_PROGRESS")}>
                                                            <Clock className="mr-2 h-4 w-4" />
                                                            Mark In Progress
                                                        </DropdownMenuItem>
                                                    )}
                                                    {vuln.status !== "RESOLVED" && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(vuln, "RESOLVED")}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Mark as Resolved
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => confirmDelete(vuln)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-between border-t">
                    <p className="text-sm text-muted-foreground">
                        Showing {paginatedVulnerabilities.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = i + 1
                            if (totalPages > 5 && currentPage > 3) {
                                pageNum = currentPage - 2 + i
                                if (pageNum > totalPages) pageNum = totalPages - 4 + i
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            )
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                                <span className="text-muted-foreground">...</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(totalPages)}
                                >
                                    {totalPages}
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
