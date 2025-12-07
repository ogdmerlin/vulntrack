'use server'

interface CirclCveResponse {
    id: string
    summary: string
    cvss: number
    references: string[]
    vulnerable_configuration: string[]
}

export async function fetchCVEData(cveId: string) {
    if (!cveId) return null

    try {
        const response = await fetch(`https://cve.circl.lu/api/cve/${cveId}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            console.error(`CIRCL API Error: ${response.status}`)
            return null
        }

        const data: CirclCveResponse = await response.json()

        if (!data) {
            return null
        }

        // CIRCL API returns "summary" for description
        const description = data.summary || "No description available."

        // CVSS Score (uses v2 or v3 mixed usually, mostly reliable)
        const cvssScore = data.cvss || 0

        // References
        const references = data.references?.map(url => ({
            url: url,
            source: new URL(url).hostname.replace('www.', '')
        })) || []

        // Affected Systems (CPEs)
        const affectedSystems: string[] = []
        if (data.vulnerable_configuration) {
            data.vulnerable_configuration.forEach((cpe: string) => {
                // Parse CPE: cpe:2.3:a:vendor:product:version...
                const parts = cpe.split(':')
                if (parts.length >= 5) {
                    const vendor = parts[3]
                    const product = parts[4]
                    const version = parts[5] !== '*' ? parts[5] : ''
                    affectedSystems.push(`${vendor} ${product} ${version}`.trim())
                } else {
                    affectedSystems.push(cpe)
                }
            })
        }

        // De-duplicate systems and limit to top 10
        const uniqueSystems = Array.from(new Set(affectedSystems)).slice(0, 10)

        return {
            description,
            cvssScore,
            references: JSON.stringify(references),
            affectedSystems: JSON.stringify(uniqueSystems)
        }
    } catch (error) {
        console.error("Failed to fetch CVE data from CIRCL:", error)
        return null
    }
}
