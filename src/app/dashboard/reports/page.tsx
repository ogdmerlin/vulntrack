'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    FileText,
    Download,
    Loader2,
    Plus,
    Bell,
    Eye,
    Share2,
    X,
    Save,
    Search,
    ChevronLeft,
    ChevronRight,
    FileBarChart,
    Settings2
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Vulnerability {
    id: string
    title: string
    severity: string
    status: string
    createdAt: Date
    dread?: { total: number } | null
    description?: string | null
}

interface GeneratedReport {
    id: string
    name: string
    type: string
    format: string
    dateGenerated: Date
    status: 'completed' | 'processing' | 'failed'
    vulnerabilityCount: number
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
    const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])

    // Form state
    const [reportName, setReportName] = useState("")
    const [reportType, setReportType] = useState("executive")
    const [reportFormat, setReportFormat] = useState("pdf")
    const [severityFilter, setSeverityFilter] = useState("all")
    const [dateRange, setDateRange] = useState({ from: "", to: "" })
    const [includeSections, setIncludeSections] = useState({
        executiveSummary: true,
        riskAssessment: true,
        chartsGraphs: true,
        vulnerabilityDetails: true,
        remediationPlans: false,
        complianceMapping: false,
    })

    // Table state
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // Preview modal state
    const [showPreviewModal, setShowPreviewModal] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const { getVulnerabilities } = await import("@/app/actions/vulnerabilities")
            const result = await getVulnerabilities()
            if (result.success && result.data) {
                setVulnerabilities(result.data as Vulnerability[])
            }

            // Load saved reports from localStorage
            const savedReports = localStorage.getItem('vulntrack_reports')
            if (savedReports) {
                const parsed = JSON.parse(savedReports).map((r: any) => ({
                    ...r,
                    dateGenerated: new Date(r.dateGenerated)
                }))
                setGeneratedReports(parsed)
            }
        } catch (error) {
            console.error("Failed to load data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Show toast message
    function showToast(message: string, type: 'success' | 'error' = 'success') {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // Scroll to form section
    function scrollToForm() {
        document.getElementById('generate-report-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    // Filter vulnerabilities based on selections
    function getFilteredVulnerabilities() {
        return vulnerabilities.filter(v => {
            if (severityFilter !== "all" && v.severity !== severityFilter) return false
            if (dateRange.from) {
                const vulnDate = new Date(v.createdAt)
                const fromDate = new Date(dateRange.from)
                if (vulnDate < fromDate) return false
            }
            if (dateRange.to) {
                const vulnDate = new Date(v.createdAt)
                const toDate = new Date(dateRange.to)
                if (vulnDate > toDate) return false
            }
            return true
        })
    }

    // Generate default report name based on type and date
    function getDefaultReportName() {
        const now = new Date()
        const quarter = Math.ceil((now.getMonth() + 1) / 3)
        const year = now.getFullYear()
        const month = now.toLocaleString('default', { month: 'long' })

        switch (reportType) {
            case "executive":
                return `Q${quarter} ${year} Security Assessment`
            case "technical":
                return `${month} ${year} Technical Analysis`
            case "compliance":
                return `${year} Compliance Audit Report`
            case "custom":
                return `Custom Security Report - ${now.toLocaleDateString()}`
            default:
                return `Vulnerability Report - ${now.toLocaleDateString()}`
        }
    }

    async function generateReport() {
        setGenerating(true)
        const filteredVulns = getFilteredVulnerabilities()
        const finalName = reportName || getDefaultReportName()

        try {
            if (reportFormat === "pdf") {
                await generatePDFReport(finalName, filteredVulns)
            } else if (reportFormat === "csv") {
                await generateCSVReport(finalName, filteredVulns)
            } else if (reportFormat === "html") {
                await generateHTMLReport(finalName, filteredVulns)
            }

            // Save to report history
            const newReport: GeneratedReport = {
                id: `report-${Date.now()}`,
                name: finalName,
                type: reportType,
                format: reportFormat.toUpperCase(),
                dateGenerated: new Date(),
                status: 'completed',
                vulnerabilityCount: filteredVulns.length
            }

            const updatedReports = [newReport, ...generatedReports]
            setGeneratedReports(updatedReports)
            localStorage.setItem('vulntrack_reports', JSON.stringify(updatedReports))

            // Reset form
            setReportName("")
        } catch (error) {
            console.error("Failed to generate report:", error)
        } finally {
            setGenerating(false)
        }
    }

    async function generatePDFReport(name: string, vulns: Vulnerability[]) {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(22)
        doc.setTextColor(30, 41, 59)
        doc.text("VulnTrack Security Report", 14, 22)

        doc.setFontSize(16)
        doc.setTextColor(100, 116, 139)
        doc.text(name, 14, 32)

        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40)
        doc.text(`Total Vulnerabilities: ${vulns.length}`, 14, 46)

        let yPos = 56

        // Executive Summary
        if (includeSections.executiveSummary) {
            doc.setFontSize(14)
            doc.setTextColor(30, 41, 59)
            doc.text("Executive Summary", 14, yPos)
            yPos += 8

            const critical = vulns.filter(v => v.severity === "CRITICAL").length
            const high = vulns.filter(v => v.severity === "HIGH").length
            const medium = vulns.filter(v => v.severity === "MEDIUM").length
            const low = vulns.filter(v => v.severity === "LOW").length
            const open = vulns.filter(v => v.status === "OPEN").length

            doc.setFontSize(10)
            doc.setTextColor(100, 116, 139)
            doc.text(`This report covers ${vulns.length} vulnerabilities identified in your infrastructure.`, 14, yPos)
            yPos += 6
            doc.text(`Critical: ${critical} | High: ${high} | Medium: ${medium} | Low: ${low}`, 14, yPos)
            yPos += 6
            doc.text(`Open Issues: ${open} | Resolved: ${vulns.length - open}`, 14, yPos)
            yPos += 14
        }

        // Risk Assessment
        if (includeSections.riskAssessment) {
            doc.setFontSize(14)
            doc.setTextColor(30, 41, 59)
            doc.text("Risk Assessment", 14, yPos)
            yPos += 8

            const avgDread = vulns.reduce((sum, v) => sum + (v.dread?.total || 0), 0) / vulns.length || 0
            doc.setFontSize(10)
            doc.setTextColor(100, 116, 139)
            doc.text(`Average DREAD Score: ${avgDread.toFixed(2)}`, 14, yPos)
            yPos += 6
            doc.text(`Risk Level: ${avgDread > 7 ? "Critical" : avgDread > 5 ? "High" : avgDread > 3 ? "Medium" : "Low"}`, 14, yPos)
            yPos += 14
        }

        // Vulnerability Details Table
        if (includeSections.vulnerabilityDetails) {
            doc.setFontSize(14)
            doc.setTextColor(30, 41, 59)
            doc.text("Vulnerability Details", 14, yPos)
            yPos += 4

            const tableData = vulns.map(v => [
                v.title.substring(0, 40) + (v.title.length > 40 ? "..." : ""),
                v.severity,
                v.status,
                v.dread?.total?.toFixed(1) || "N/A",
                new Date(v.createdAt).toLocaleDateString()
            ])

            autoTable(doc, {
                head: [['Vulnerability', 'Severity', 'Status', 'DREAD', 'Date']],
                body: tableData,
                startY: yPos,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [30, 41, 59] }
            })
        }

        doc.save(`${name.replace(/[^a-z0-9]/gi, '_')}.pdf`)
    }

    async function generateCSVReport(name: string, vulns: Vulnerability[]) {
        const headers = ["ID", "Title", "Severity", "Status", "DREAD Score", "Created At", "Description"]
        const rows = vulns.map(v => [
            v.id,
            `"${v.title.replace(/"/g, '""')}"`,
            v.severity,
            v.status,
            v.dread?.total || 0,
            v.createdAt,
            `"${(v.description || "").replace(/"/g, '""')}"`
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${name.replace(/[^a-z0-9]/gi, '_')}.csv`
        link.click()
    }

    async function generateHTMLReport(name: string, vulns: Vulnerability[]) {
        const critical = vulns.filter(v => v.severity === "CRITICAL").length
        const high = vulns.filter(v => v.severity === "HIGH").length
        const medium = vulns.filter(v => v.severity === "MEDIUM").length
        const low = vulns.filter(v => v.severity === "LOW").length

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        h1 { color: #1e293b; } h2 { color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .stat { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat h3 { margin: 0; color: #64748b; font-size: 14px; } .stat p { margin: 5px 0 0; font-size: 32px; font-weight: bold; }
        .critical { color: #dc2626; } .high { color: #ea580c; } .medium { color: #ca8a04; } .low { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th { background: #1e293b; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        tr:hover { background: #f1f5f9; }
        .badge { padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
        .badge-critical { background: #fef2f2; color: #dc2626; } .badge-high { background: #fff7ed; color: #ea580c; }
        .badge-medium { background: #fefce8; color: #ca8a04; } .badge-low { background: #eff6ff; color: #2563eb; }
    </style>
</head>
<body>
    <h1>VulnTrack Security Report</h1>
    <p style="color:#64748b;">${name} • Generated: ${new Date().toLocaleString()}</p>
    
    <div class="stats">
        <div class="stat"><h3>Critical</h3><p class="critical">${critical}</p></div>
        <div class="stat"><h3>High</h3><p class="high">${high}</p></div>
        <div class="stat"><h3>Medium</h3><p class="medium">${medium}</p></div>
        <div class="stat"><h3>Low</h3><p class="low">${low}</p></div>
    </div>
    
    <h2>Vulnerability Details</h2>
    <table>
        <thead><tr><th>Title</th><th>Severity</th><th>Status</th><th>DREAD Score</th><th>Date</th></tr></thead>
        <tbody>
            ${vulns.map(v => `
                <tr>
                    <td>${v.title}</td>
                    <td><span class="badge badge-${v.severity.toLowerCase()}">${v.severity}</span></td>
                    <td>${v.status}</td>
                    <td>${v.dread?.total?.toFixed(1) || "N/A"}</td>
                    <td>${new Date(v.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`

        const blob = new Blob([htmlContent], { type: "text/html" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${name.replace(/[^a-z0-9]/gi, '_')}.html`
        link.click()
    }

    // Filter reports for table
    const filteredReports = generatedReports.filter(r => {
        if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (typeFilter !== "all" && r.type !== typeFilter) return false
        return true
    })

    const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage)

    function getTypeLabel(type: string) {
        const labels: Record<string, string> = {
            executive: "Executive Summary",
            technical: "Technical Assessment",
            compliance: "Compliance Report",
            custom: "Custom Report"
        }
        return labels[type] || type
    }

    function downloadReport(report: GeneratedReport) {
        // Re-generate the report
        const filteredVulns = vulnerabilities
        showToast(`Downloading ${report.name}...`)
        if (report.format === "PDF") {
            generatePDFReport(report.name, filteredVulns)
        } else if (report.format === "CSV") {
            generateCSVReport(report.name, filteredVulns)
        } else if (report.format === "HTML") {
            generateHTMLReport(report.name, filteredVulns)
        }
    }

    function viewReport(report: GeneratedReport) {
        // For HTML reports, open in new tab. For others, download.
        const filteredVulns = vulnerabilities
        if (report.format === "HTML") {
            const critical = filteredVulns.filter(v => v.severity === "CRITICAL").length
            const high = filteredVulns.filter(v => v.severity === "HIGH").length
            const medium = filteredVulns.filter(v => v.severity === "MEDIUM").length
            const low = filteredVulns.filter(v => v.severity === "LOW").length

            const htmlContent = `<!DOCTYPE html><html><head><title>${report.name}</title><style>body{font-family:system-ui,sans-serif;max-width:1200px;margin:0 auto;padding:20px;background:#f8fafc}h1{color:#1e293b}h2{color:#475569;border-bottom:2px solid #e2e8f0;padding-bottom:10px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin:20px 0}.stat{background:white;padding:20px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.stat h3{margin:0;color:#64748b;font-size:14px}.stat p{margin:5px 0 0;font-size:32px;font-weight:bold}.critical{color:#dc2626}.high{color:#ea580c}.medium{color:#ca8a04}.low{color:#2563eb}table{width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)}th{background:#1e293b;color:white;padding:12px;text-align:left}td{padding:12px;border-bottom:1px solid #e2e8f0}</style></head><body><h1>VulnTrack Security Report</h1><p style="color:#64748b">${report.name} • Generated: ${report.dateGenerated.toLocaleString()}</p><div class="stats"><div class="stat"><h3>Critical</h3><p class="critical">${critical}</p></div><div class="stat"><h3>High</h3><p class="high">${high}</p></div><div class="stat"><h3>Medium</h3><p class="medium">${medium}</p></div><div class="stat"><h3>Low</h3><p class="low">${low}</p></div></div><h2>Vulnerability Details</h2><table><thead><tr><th>Title</th><th>Severity</th><th>Status</th><th>DREAD</th><th>Date</th></tr></thead><tbody>${filteredVulns.map(v => `<tr><td>${v.title}</td><td>${v.severity}</td><td>${v.status}</td><td>${v.dread?.total?.toFixed(1) || "N/A"}</td><td>${new Date(v.createdAt).toLocaleDateString()}</td></tr>`).join('')}</tbody></table></body></html>`
            const blob = new Blob([htmlContent], { type: "text/html" })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
        } else {
            downloadReport(report)
        }
    }

    function shareReport(report: GeneratedReport) {
        const shareText = `VulnTrack Report: ${report.name} (${report.vulnerabilityCount} vulnerabilities) - Generated ${report.dateGenerated.toLocaleDateString()}`
        if (navigator.share) {
            navigator.share({
                title: report.name,
                text: shareText,
            }).catch(() => {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareText)
                showToast('Report details copied to clipboard')
            })
        } else {
            navigator.clipboard.writeText(shareText)
            showToast('Report details copied to clipboard')
        }
    }

    function deleteReport(reportId: string) {
        const updatedReports = generatedReports.filter(r => r.id !== reportId)
        setGeneratedReports(updatedReports)
        localStorage.setItem('vulntrack_reports', JSON.stringify(updatedReports))
        showToast('Report deleted')
    }

    function saveTemplate() {
        const template = {
            id: `template-${Date.now()}`,
            name: reportName || getDefaultReportName(),
            type: reportType,
            format: reportFormat,
            severityFilter,
            includeSections,
            savedAt: new Date().toISOString()
        }
        const existingTemplates = JSON.parse(localStorage.getItem('vulntrack_templates') || '[]')
        localStorage.setItem('vulntrack_templates', JSON.stringify([template, ...existingTemplates]))
        showToast('Template saved successfully')
    }

    function openPreview() {
        setShowPreviewModal(true)
    }

    const previewVulns = getFilteredVulnerabilities()

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
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.message}
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Report Preview</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowPreviewModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{reportName || getDefaultReportName()}</h2>
                                    <p className="text-muted-foreground">Generated: {new Date().toLocaleString()}</p>
                                </div>

                                {includeSections.executiveSummary && (
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-semibold mb-2">Executive Summary</h4>
                                        <p className="text-sm text-muted-foreground">
                                            This report covers {previewVulns.length} vulnerabilities.
                                            Critical: {previewVulns.filter(v => v.severity === "CRITICAL").length} |
                                            High: {previewVulns.filter(v => v.severity === "HIGH").length} |
                                            Medium: {previewVulns.filter(v => v.severity === "MEDIUM").length} |
                                            Low: {previewVulns.filter(v => v.severity === "LOW").length}
                                        </p>
                                    </div>
                                )}

                                {includeSections.vulnerabilityDetails && (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    <th className="text-left p-3">Title</th>
                                                    <th className="text-left p-3">Severity</th>
                                                    <th className="text-left p-3">Status</th>
                                                    <th className="text-left p-3">DREAD</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewVulns.slice(0, 5).map(v => (
                                                    <tr key={v.id} className="border-t">
                                                        <td className="p-3">{v.title}</td>
                                                        <td className="p-3">
                                                            <Badge variant="outline">{v.severity}</Badge>
                                                        </td>
                                                        <td className="p-3">{v.status}</td>
                                                        <td className="p-3">{v.dread?.total?.toFixed(1) || "N/A"}</td>
                                                    </tr>
                                                ))}
                                                {previewVulns.length > 5 && (
                                                    <tr className="border-t bg-slate-50">
                                                        <td colSpan={4} className="p-3 text-center text-muted-foreground">
                                                            ... and {previewVulns.length - 5} more vulnerabilities
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Close</Button>
                            <Button onClick={() => { setShowPreviewModal(false); generateReport(); }} className="bg-slate-900 hover:bg-slate-800">
                                <Download className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                    <p className="text-sm text-muted-foreground">
                        Generate and view vulnerability assessment reports
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        onClick={scrollToForm}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Generate New Report Card */}
            <Card id="generate-report-form">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileBarChart className="h-5 w-5" />
                        Generate New Report
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Report Name */}
                            <div className="space-y-2">
                                <Label htmlFor="reportName">Report Name</Label>
                                <Input
                                    id="reportName"
                                    placeholder={getDefaultReportName()}
                                    value={reportName}
                                    onChange={(e) => setReportName(e.target.value)}
                                />
                            </div>

                            {/* Type and Format */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Report Type</Label>
                                    <Select value={reportType} onValueChange={setReportType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="executive">Executive Summary</SelectItem>
                                            <SelectItem value="technical">Technical Assessment</SelectItem>
                                            <SelectItem value="compliance">Compliance Report</SelectItem>
                                            <SelectItem value="custom">Custom Report</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Format</Label>
                                    <Select value={reportFormat} onValueChange={setReportFormat}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="html">HTML</SelectItem>
                                            <SelectItem value="csv">CSV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Date Range and Severity */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Date Range</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={dateRange.from}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                        />
                                        <span className="flex items-center text-muted-foreground">to</span>
                                        <Input
                                            type="date"
                                            value={dateRange.to}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Severity Filter</Label>
                                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Severities</SelectItem>
                                            <SelectItem value="CRITICAL">Critical Only</SelectItem>
                                            <SelectItem value="HIGH">High & Above</SelectItem>
                                            <SelectItem value="MEDIUM">Medium & Above</SelectItem>
                                            <SelectItem value="LOW">All Including Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Include Sections */}
                            <div className="space-y-3">
                                <Label>Include Sections</Label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="execSummary"
                                            checked={includeSections.executiveSummary}
                                            onCheckedChange={(checked) => setIncludeSections(prev => ({ ...prev, executiveSummary: !!checked }))}
                                        />
                                        <label htmlFor="execSummary" className="text-sm">Executive Summary</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="vulnDetails"
                                            checked={includeSections.vulnerabilityDetails}
                                            onCheckedChange={(checked) => setIncludeSections(prev => ({ ...prev, vulnerabilityDetails: !!checked }))}
                                        />
                                        <label htmlFor="vulnDetails" className="text-sm">Vulnerability Details</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="riskAssess"
                                            checked={includeSections.riskAssessment}
                                            onCheckedChange={(checked) => setIncludeSections(prev => ({ ...prev, riskAssessment: !!checked }))}
                                        />
                                        <label htmlFor="riskAssess" className="text-sm">Risk Assessment</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="remediation"
                                            checked={includeSections.remediationPlans}
                                            onCheckedChange={(checked) => setIncludeSections(prev => ({ ...prev, remediationPlans: !!checked }))}
                                        />
                                        <label htmlFor="remediation" className="text-sm">Remediation Plans</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="charts"
                                            checked={includeSections.chartsGraphs}
                                            onCheckedChange={(checked) => setIncludeSections(prev => ({ ...prev, chartsGraphs: !!checked }))}
                                        />
                                        <label htmlFor="charts" className="text-sm">Charts & Graphs</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="compliance"
                                            checked={includeSections.complianceMapping}
                                            onCheckedChange={(checked) => setIncludeSections(prev => ({ ...prev, complianceMapping: !!checked }))}
                                        />
                                        <label htmlFor="compliance" className="text-sm">Compliance Mapping</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Preview */}
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4 min-h-[300px] bg-muted/30">
                                <h4 className="font-medium mb-4">Report Preview</h4>
                                {previewVulns.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <FileText className="h-12 w-12 mb-2 opacity-50" />
                                        <p className="text-sm">No vulnerabilities match your filters</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Report:</strong> {reportName || getDefaultReportName()}</p>
                                        <p><strong>Type:</strong> {getTypeLabel(reportType)}</p>
                                        <p><strong>Format:</strong> {reportFormat.toUpperCase()}</p>
                                        <p><strong>Vulnerabilities:</strong> {previewVulns.length}</p>
                                        <div className="flex gap-2 mt-4">
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                Critical: {previewVulns.filter(v => v.severity === "CRITICAL").length}
                                            </Badge>
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                High: {previewVulns.filter(v => v.severity === "HIGH").length}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                Medium: {previewVulns.filter(v => v.severity === "MEDIUM").length}
                                            </Badge>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                Low: {previewVulns.filter(v => v.severity === "LOW").length}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-base py-6"
                                onClick={generateReport}
                                disabled={generating || previewVulns.length === 0}
                                size="lg"
                            >
                                {generating ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-5 w-5" />
                                )}
                                Generate & Download Report
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={previewVulns.length === 0}
                                onClick={openPreview}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Report
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={saveTemplate}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save as Template
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Reports Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Reports</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search reports..."
                                    className="pl-9 w-[200px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="executive">Executive</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Report Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date Generated</TableHead>
                                <TableHead>Format</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No reports generated yet. Create your first report above.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedReports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{report.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getTypeLabel(report.type)}</TableCell>
                                        <TableCell>
                                            {report.dateGenerated.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </TableCell>
                                        <TableCell>{report.format}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    report.status === 'completed'
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : report.status === 'processing'
                                                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                            : "bg-red-50 text-red-700 border-red-200"
                                                }
                                            >
                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => downloadReport(report)}
                                                    title="Download"
                                                >
                                                    <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => viewReport(report)}
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => shareReport(report)}
                                                    title="Share"
                                                >
                                                    <Share2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => deleteReport(report.id)}
                                                    title="Delete"
                                                >
                                                    <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {filteredReports.length > 0 && (
                        <div className="flex items-center justify-between pt-4 border-t mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
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
                                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
                                    <Button
                                        key={i + 1}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
