import "dotenv/config";
import { importCve } from "./src/app/actions/cve";

async function main() {
    const cveId = "CVE-2023-34362"; // a known CVE with CPEs and Refs
    console.log(`Fetching data for ${cveId}...`);
    try {
        const result = await importCve(cveId);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
