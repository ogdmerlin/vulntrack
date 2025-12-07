'use server'

import { fetchCveData } from "@/lib/cve"
import { mapCvssToDread } from "@/lib/scoring"
import { createVulnerability } from "@/app/actions/vulnerabilities"

export async function importCve(cveId: string) {
    const cveData = await fetchCveData(cveId)

    if (!cveData) {
        return { success: false, error: "CVE not found or API error" }
    }

    // Extract relevant data
    const title = cveData.id ? `${cveData.id}: ${cveData.summary?.substring(0, 100) || "No summary available"}...` : "Unknown CVE"
    const description = cveData.summary || "No description available for this CVE."
    const cvssVector = cveData.cvss_vector || cveData["cvss-vector"] // Handle different API response formats

    // Map to DREAD
    const dreadScore = mapCvssToDread(cvssVector)

    // Create Vulnerability
    // We'll return the data for the user to review before saving, 
    // or we could save it directly. Let's return it for review.

    return {
        success: true,
        data: {
            title,
            description,
            dread: dreadScore,
            originalCve: cveData
        }
    }
}
