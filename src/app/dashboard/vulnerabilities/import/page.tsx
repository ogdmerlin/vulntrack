'use client'

import { useState } from "react"
import { importCve } from "@/app/actions/cve"
import { createVulnerability } from "@/app/actions/vulnerabilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Import, ArrowRight, ShieldAlert, Database, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { DreadCalculator } from "@/components/scoring/DreadCalculator"

export default function ImportCvePage() {
    const router = useRouter()
    const [cveId, setCveId] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [previewData, setPreviewData] = useState<any>(null)
    const [importing, setImporting] = useState(false)

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (!cveId.trim()) return

        setLoading(true)
        setError("")
        setPreviewData(null)

        const result = await importCve(cveId)
        if (result.success) {
            setPreviewData(result.data)
        } else {
            setError(result.error || "Failed to fetch CVE")
        }
        setLoading(false)
    }

    async function handleImport() {
        if (!previewData) return
        setImporting(true)

        const result = await createVulnerability({
            title: previewData.title,
            description: previewData.description,
            severity: "HIGH", // Default, should be calculated from DREAD total
            status: "OPEN",
            dread: previewData.dread,
            stride: { // Default STRIDE, user can edit later
                spoofing: false,
                tampering: false,
                reputation: false,
                informationDisclosure: false,
                denialOfService: false,
                elevationOfPrivilege: false
            }
        })

        if (result.success && result.data) {
            router.push(`/dashboard/vulnerabilities/${result.data.id}`)
        } else {
            setError("Failed to create vulnerability")
            setImporting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Import CVE</h1>
                <p className="text-muted-foreground">
                    Search for a CVE ID to automatically import details and calculate initial DREAD scores.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search CVE</CardTitle>
                    <CardDescription>Enter a CVE ID (e.g., CVE-2021-44228)</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="CVE-YYYY-NNNN"
                                value={cveId}
                                onChange={(e) => setCveId(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={loading || !cveId.trim()}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Search
                        </Button>
                    </form>
                    {error && <p className="text-destructive mt-4">{error}</p>}
                </CardContent>
            </Card>

            {previewData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Preview Import</CardTitle>
                                <div className="flex gap-2">
                                    {/* Source Badge */}
                                    <Badge variant="outline" className="gap-1">
                                        <Database className="h-3 w-3" />
                                        {previewData.source || "NIST"}
                                    </Badge>

                                    {/* KEV Badge */}
                                    {previewData.isKEV && (
                                        <Badge variant="destructive" className="gap-1 animate-pulse">
                                            <ShieldAlert className="h-3 w-3" />
                                            Exploited in Wild
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <p className="text-sm font-medium">{previewData.title}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <p className="text-sm text-muted-foreground">{previewData.description}</p>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-4">Calculate DREAD Score</h4>
                                <DreadCalculator
                                    initialValues={previewData.dread}
                                    onChange={(newValues) => setPreviewData((prev: any) => ({ ...prev, dread: newValues }))}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleImport} disabled={importing} size="lg">
                                    {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Import className="mr-2 h-4 w-4" />}
                                    Import Vulnerability
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
