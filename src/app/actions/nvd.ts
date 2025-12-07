'use server'

interface NVDResponse {
    vulnerabilities: Array<{
        cve: {
            id: string
            descriptions: Array<{ lang: string, value: string }>
            metrics: {
                cvssMetricV31?: Array<{ cvssData: { baseScore: number } }>
                cvssMetricV2?: Array<{ cvssData: { baseScore: number } }>
            }
            references: Array<{ url: string, source: string }>
            configurations?: Array<{
                nodes: Array<{
                    cpeMatch: Array<{ criteria: string }>
                }>
            }>
        }
    }>
}

export async function fetchCVEData(cveId: string) {
    if (!cveId) return null

    try {
        const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            console.error(`NVD API Error: ${response.status}`)
            return null
        }

        const data: NVDResponse = await response.json()

        if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
            return null
        }

        const cve = data.vulnerabilities[0].cve

        // Extract Description
        const description = cve.descriptions.find(d => d.lang === 'en')?.value || "No description available."

        // Extract Score (V3.1 preferred, then V2)
        const v3Score = cve.metrics.cvssMetricV31?.[0]?.cvssData.baseScore
        const v2Score = cve.metrics.cvssMetricV2?.[0]?.cvssData.baseScore
        const cvssScore = v3Score || v2Score || 0

        // Extract References
        const references = cve.references.map(ref => ({
            url: ref.url,
            source: ref.source || "NVD"
        }))

        // Extract Affected Systems (CPEs)
        const affectedSystems: string[] = []
        cve.configurations?.forEach(config => {
            config.nodes.forEach(node => {
                node.cpeMatch.forEach(match => {
                    // CPE format: cpe:2.3:a:vendor:product:version...
                    // We'll try to make it readable: "vendor product version"
                    const parts = match.criteria.split(':')
                    if (parts.length >= 5) {
                        const vendor = parts[3]
                        const product = parts[4]
                        const version = parts[5] !== '*' ? parts[5] : ''
                        affectedSystems.push(`${vendor} ${product} ${version}`.trim())
                    } else {
                        affectedSystems.push(match.criteria)
                    }
                })
            })
        })

        // De-duplicate systems and limit to top 10 to save space
        const uniqueSystems = Array.from(new Set(affectedSystems)).slice(0, 10)

        return {
            description,
            cvssScore,
            references: JSON.stringify(references),
            affectedSystems: JSON.stringify(uniqueSystems)
        }
    } catch (error) {
        console.error("Failed to fetch CVE data:", error)
        return null
    }
}
