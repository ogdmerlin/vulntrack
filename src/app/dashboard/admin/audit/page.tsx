'use client'

import { useEffect, useState } from "react"
import { getAuditLogs } from "@/app/actions/audit"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Loader2, FileText } from "lucide-react"
import { useSession } from "next-auth/react"

export default function AuditLogsPage() {
    const { data: session } = useSession()
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLogs()
    }, [])

    async function loadLogs() {
        const result = await getAuditLogs()
        if (result.success && result.data) {
            setLogs(result.data)
        }
        setLoading(false)
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.action}</TableCell>
                                <TableCell>{log.entityType} {log.entityId && `(${log.entityId.substring(0, 8)}...)`}</TableCell>
                                <TableCell>{log.details}</TableCell>
                                <TableCell>{log.user.email}</TableCell>
                                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
