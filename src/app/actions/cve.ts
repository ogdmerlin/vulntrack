'use server'

import { mapCvssToDread } from "@/lib/scoring"
import { fetchCVEData as fetchNistData } from "./nvd"

const VULNCHECK_API_KEY = process.env.VULNCHECK_API_KEY
const VULNCHECK_BASE_URL = "https://api.vulncheck.com/v3"

async function fetchVulnCheckData(cveId: string) {
    if (!VULNCHECK_API_KEY) return null

    try {
        // Fetch CVE Details from nist-nvd2 index
        const response = await fetch(`${VULNCHECK_BASE_URL}/index/nist-nvd2?cve=${cveId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${VULNCHECK_API_KEY}`
            },
            next: { revalidate: 3600 }
        })

        if (!response.ok) return null

        const data = await response.json()
        if (!data.data || data.data.length === 0) return null

        return data.data[0]
    } catch (error) {
        console.error("VulnCheck API Error:", error)
        return null
    }
}

async function checkKEV(cveId: string) {
    if (!VULNCHECK_API_KEY) return false

    try {
        const response = await fetch(`${VULNCHECK_BASE_URL}/index/vulncheck-kev?cve=${cveId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${VULNCHECK_API_KEY}`
            },
            next: { revalidate: 3600 }
        })

        if (!response.ok) return false
        const data = await response.json()
        return data.data && data.data.length > 0
    } catch (error) {
        return false
    }
}

export async function importCve(cveId: string) {
    let source = "NIST/CIRCL"
    let cveData: any = null
    let isKEV = false

    // 1. Try VulnCheck (Primary)
    const vulnCheckResult = await fetchVulnCheckData(cveId)
    if (vulnCheckResult) {
        source = "VulnCheck"
        cveData = vulnCheckResult
        // Check KEV if found in VulnCheck
        isKEV = await checkKEV(cveId)
    } else {
        // 2. Fallback to Official NIST API
        console.log(`Fallback to NIST for ${cveId}`)
        const nistResult = await fetchNistData(cveId)
        if (nistResult) {
            cveData = nistResult
        }
    }

    if (!cveData) {
        return { success: false, error: "CVE not found in any database." }
    }

    // Normalize Data
    // VulnCheck and CIRCL have different structures, need to standardize

    let title = ""
    let description = ""
    let cvssScore = 0
    let affectedSystems: string[] = []
    let references: any[] = []

    if (source === "VulnCheck") {
        title = `${cveData.id}: ${cveData.descriptions?.[0]?.value?.substring(0, 60)}...` || cveId
        description = cveData.descriptions?.[0]?.value || "No description."

        // Extract CVSS v3.1 > v3.0 > v2
        const metrics = cveData.metrics
        if (metrics?.cvssMetricV31) {
            cvssScore = metrics.cvssMetricV31[0].cvssData.baseScore
        } else if (metrics?.cvssMetricV30) {
            cvssScore = metrics.cvssMetricV30[0].cvssData.baseScore
        } else if (metrics?.cvssMetricV2) {
            cvssScore = metrics.cvssMetricV2[0].cvssData.baseScore
        }

        // References
        if (cveData.references) {
            references = cveData.references.map((ref: any) => ({
                url: ref.url,
                source: new URL(ref.url).hostname.replace('www.', '')
            })).slice(0, 5)
        }

        // Configurations (Complex parsing, simplified here)
        // VulnCheck returns raw configurations, checking cpeMatch
        if (cveData.configurations) {
            // Basic extraction logic would go here
            // For now, placeholder or deep parsing
        }

    } else {
        // CIRCL Data (Already formatting in fetchCVEData)
        // We need to re-parse because fetchCVEData returns formatted object
        // Wait, fetchCVEData returns { description, cvssScore, references(stringified), affectedSystems(stringified) }

        title = `${cveId}: ${cveData.description.substring(0, 60)}...`
        description = cveData.description
        cvssScore = cveData.cvssScore
        try {
            affectedSystems = JSON.parse(cveData.affectedSystems)
            references = JSON.parse(cveData.references)
        } catch (e) { }
    }

    // Map to DREAD manually based on CVSS and KEV
    // const dreadScore = mapCvssToDread("") // Unused
    // Let's improve scoring mapping manually since mapCvssToDread expects vector string which we might miss
    // The previous code had mapCvssToDread(cvssVector)... 
    // We can infer DREAD from CVSS Score for better defaults

    const derivedDread = {
        damage: Math.min(10, Math.ceil(cvssScore)), // High CVSS = High Damage
        reproducibility: 5, // Default
        exploitability: isKEV ? 10 : Math.min(10, Math.ceil(cvssScore)), // KEV = 10
        affectedUsers: 5,
        discoverability: 5,
        total: 0 // Calc later
    }
    derivedDread.total = (derivedDread.damage + derivedDread.reproducibility + derivedDread.exploitability + derivedDread.affectedUsers + derivedDread.discoverability) / 5

    return {
        success: true,
        data: {
            cveId: cveId,
            title,
            description,
            cvssScore,
            affectedSystems: JSON.stringify(affectedSystems),
            references: JSON.stringify(references),
            dread: derivedDread,
            source: source,
            isKEV: isKEV
        }
    }
}
