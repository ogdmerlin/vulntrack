export async function fetchCveData(cveId: string) {
    try {
        const response = await fetch(`https://cve.circl.lu/api/cve/${cveId}`)
        if (!response.ok) {
            return null
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error("Failed to fetch CVE data:", error)
        return null
    }
}
