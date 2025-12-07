'use server'

const NIST_API_KEY = process.env.NIST_API_KEY
const NIST_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

export async function fetchCVEData(cveId: string) {
    if (!cveId) return null

    try {
        const headers: HeadersInit = {
            'Accept': 'application/json'
        }
        if (NIST_API_KEY) {
            headers['apiKey'] = NIST_API_KEY
        }

        const response = await fetch(`${NIST_BASE_URL}?cveId=${cveId}`, {
            headers,
            next: { revalidate: 3600 }
        })

        if (!response.ok) {
            console.error(`NIST API Error: ${response.status}`)
            return null
        }

        const data = await response.json()
        const vulnerabilities = data.vulnerabilities

        if (!vulnerabilities || vulnerabilities.length === 0) {
            return null
        }

        const vulnItem = vulnerabilities[0].cve
        const description = vulnItem.descriptions?.find((d: any) => d.lang === 'en')?.value || "No description available."

        // Extract Metrics
        const metrics = vulnItem.metrics
        let cvssScore = 0
        if (metrics?.cvssMetricV31) {
            cvssScore = metrics.cvssMetricV31[0].cvssData.baseScore
        } else if (metrics?.cvssMetricV30) {
            cvssScore = metrics.cvssMetricV30[0].cvssData.baseScore
        } else if (metrics?.cvssMetricV2) {
            cvssScore = metrics.cvssMetricV2[0].cvssData.baseScore
        }

        // References
        const references = vulnItem.references?.map((ref: any) => ({
            url: ref.url,
            source: new URL(ref.url).hostname.replace('www.', '')
        })) || []

        // Affected Systems (Configurations)
        const affectedSystems: string[] = []
        if (vulnItem.configurations) {
            vulnItem.configurations.forEach((config: any) => {
                config.nodes?.forEach((node: any) => {
                    node.cpeMatch?.forEach((match: any) => {
                        const cpe = match.criteria
                        // Simple parsing
                        const parts = cpe.split(':')
                        if (parts.length >= 5) {
                            affectedSystems.push(`${parts[3]} ${parts[4]} ${parts[5] !== '*' ? parts[5] : ''}`.trim())
                        } else {
                            affectedSystems.push(cpe)
                        }
                    })
                })
            })
        }
        const uniqueSystems = Array.from(new Set(affectedSystems)).slice(0, 10)

        return {
            description,
            cvssScore,
            references: JSON.stringify(references),
            affectedSystems: JSON.stringify(uniqueSystems)
        }

    } catch (error) {
        console.error("Failed to fetch CVE data from NIST:", error)
        return null
    }
}
