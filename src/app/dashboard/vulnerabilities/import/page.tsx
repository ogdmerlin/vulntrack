'use client'

import { useState, useEffect, useRef } from "react"
import { importCve } from "@/app/actions/cve"
import { searchCVEs, type CVESuggestion } from "@/app/actions/cve-search"
import { createVulnerability } from "@/app/actions/vulnerabilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Import, Shield, Server, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { DreadCalculator } from "@/components/scoring/DreadCalculator"
import { cn } from "@/lib/utils"

export default function ImportCvePage() {
    const router = useRouter()
    const [cveId, setCveId] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [previewData, setPreviewData] = useState<any>(null)
    const [importing, setImporting] = useState(false)

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<CVESuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searchingCves, setSearchingCves] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Debounced CVE search
    useEffect(() => {
        if (cveId.length < 4) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        const timer = setTimeout(async () => {
            setSearchingCves(true)
            const result = await searchCVEs(cveId)
            if (result.success && result.data) {
                setSuggestions(result.data)
                setShowSuggestions(result.data.length > 0)
            }
            setSearchingCves(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [cveId])

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!showSuggestions || suggestions.length === 0) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, -1))
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            e.preventDefault()
            handleSelectSuggestion(suggestions[selectedIndex])
        } else if (e.key === "Escape") {
            setShowSuggestions(false)
        }
    }

    function handleSelectSuggestion(suggestion: CVESuggestion) {
        setCveId(suggestion.cveId)
        setShowSuggestions(false)
        setSelectedIndex(-1)
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (!cveId.trim()) return

        setLoading(true)
        setError("")
        setPreviewData(null)
        setShowSuggestions(false)

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
            cveId: cveId,
            title: previewData.title,
            description: previewData.description,
            severity: "HIGH",
            status: "OPEN",
            dread: previewData.dread,
            stride: {
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

    function getSeverityColor(severity: string) {
        switch (severity?.toUpperCase()) {
            case "CRITICAL": return "bg-red-500 text-white"
            case "HIGH": return "bg-orange-500 text-white"
            case "MEDIUM": return "bg-yellow-500 text-black"
            case "LOW": return "bg-green-500 text-white"
            default: return "bg-gray-500 text-white"
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
                    <CardDescription>Start typing a CVE ID (e.g., CVE-2021-44228) to see suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Input
                                ref={inputRef}
                                placeholder="CVE-YYYY-NNNN"
                                value={cveId}
                                onChange={(e) => setCveId(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                autoComplete="off"
                            />
                            {searchingCves && (
                                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                            )}

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    ref={suggestionsRef}
                                    className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto"
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={suggestion.cveId}
                                            className={cn(
                                                "px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors",
                                                index === selectedIndex
                                                    ? "bg-accent"
                                                    : "hover:bg-muted"
                                            )}
                                            onClick={() => handleSelectSuggestion(suggestion)}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium text-sm">{suggestion.cveId}</span>
                                                <div className="flex items-center gap-2">
                                                    {suggestion.cvssScore && (
                                                        <Badge variant="outline" className="text-xs">
                                                            CVSS {suggestion.cvssScore}
                                                        </Badge>
                                                    )}
                                                    <Badge className={cn("text-xs", getSeverityColor(suggestion.severity))}>
                                                        {suggestion.severity}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {suggestion.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    <Badge variant="outline" className="gap-1">
                                        <Server className="h-3 w-3" />
                                        {previewData.source || "NIST"}
                                    </Badge>
                                    {previewData.isKEV && (
                                        <Badge variant="destructive" className="gap-1 animate-pulse">
                                            <Shield className="h-3 w-3" />
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
