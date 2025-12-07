import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { getVulnerabilities } from "@/app/actions/vulnerabilities"

export default async function MisconfigurationsPage() {
    const { data: allVulns } = await getVulnerabilities()

    // Filter for items that look like misconfigurations (based on our convention)
    const misconfigurations = allVulns?.filter((v: any) => v.title.includes("[Misconfig]")) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h2 className="text-3xl font-bold tracking-tight">Misconfigurations</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Misconfigurations</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{misconfigurations.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {misconfigurations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No misconfigurations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            misconfigurations.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title.replace("[Misconfig] ", "")}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.severity}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === "OPEN" ? "destructive" : "secondary"}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
