'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Plus, Eye, CheckCircle2, Loader2 } from "lucide-react"
import { getVulnerabilities, updateVulnerabilityStatus } from "@/app/actions/vulnerabilities"
import { MisconfigDialog } from "@/components/misconfiguration/MisconfigDialog"
import { useRouter } from "next/navigation"

export default function MisconfigurationsPage() {
    const router = useRouter()
    const [misconfigurations, setMisconfigurations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [statusLoading, setStatusLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        loadMisconfigurations()
    }, [])

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    async function loadMisconfigurations() {
        setLoading(true)
        const { data: allVulns } = await getVulnerabilities()
        const misconfigs = allVulns?.filter((v: any) => v.title.includes("[Misconfig]")) || []
        setMisconfigurations(misconfigs)
        setLoading(false)
    }

    async function handleStatusChange(id: string, newStatus: string) {
        setStatusLoading(true)
        await updateVulnerabilityStatus(id, newStatus)

        // Update local state
        setMisconfigurations(prev =>
            prev.map(m => m.id === id ? { ...m, status: newStatus } : m)
        )
        if (selectedItem?.id === id) {
            setSelectedItem((prev: any) => ({ ...prev, status: newStatus }))
        }

        setStatusLoading(false)
        setToast({ message: `Status updated to ${newStatus}`, type: 'success' })
    }

    function getSeverityColor(severity: string) {
        switch (severity) {
            case "CRITICAL": return "destructive"
            case "HIGH": return "destructive"
            case "MEDIUM": return "default"
            case "LOW": return "secondary"
            default: return "outline"
        }
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    <CheckCircle2 className="h-4 w-4" />
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <h2 className="text-3xl font-bold tracking-tight">Misconfigurations</h2>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Misconfiguration
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{misconfigurations.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {misconfigurations.filter(m => m.status === 'OPEN').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {misconfigurations.filter(m => m.status === 'IN_PROGRESS').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {misconfigurations.filter(m => m.status === 'RESOLVED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : misconfigurations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No misconfigurations found. Click "Add Misconfiguration" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            misconfigurations.map((item: any) => (
                                <TableRow key={item.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        {item.title.replace("[Misconfig] ", "")}
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {item.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getSeverityColor(item.severity) as any}>
                                            {item.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === "OPEN" ? "destructive" : item.status === "RESOLVED" ? "default" : "secondary"}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <MisconfigDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => {
                    loadMisconfigurations()
                    setToast({ message: "Misconfiguration created", type: 'success' })
                }}
            />

            {/* Details Sheet */}
            <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Misconfiguration Details</SheetTitle>
                        <SheetDescription>
                            View and update this misconfiguration
                        </SheetDescription>
                    </SheetHeader>

                    {selectedItem && (
                        <div className="space-y-6 py-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Title</Label>
                                <p className="font-medium">
                                    {selectedItem.title.replace("[Misconfig] ", "")}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="text-sm">{selectedItem.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Severity</Label>
                                    <Badge variant={getSeverityColor(selectedItem.severity) as any}>
                                        {selectedItem.severity}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Created</Label>
                                    <p className="text-sm">
                                        {new Date(selectedItem.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={selectedItem.status}
                                    onValueChange={(value) => handleStatusChange(selectedItem.id, value)}
                                    disabled={statusLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Open</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Remediation Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add notes about remediation steps taken..."
                                    className="min-h-[100px]"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Document the steps taken to remediate this misconfiguration
                                </p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
