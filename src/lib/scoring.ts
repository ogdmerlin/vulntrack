
interface DreadScore {
    damage: number
    reproducibility: number
    exploitability: number
    affectedUsers: number
    discoverability: number
    total: number
}

export function mapCvssToDread(cvssVector: string): DreadScore {
    // Default score if parsing fails
    const score: DreadScore = {
        damage: 5,
        reproducibility: 5,
        exploitability: 5,
        affectedUsers: 5,
        discoverability: 5,
        total: 5
    }

    if (!cvssVector) return score

    // Example Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H

    // 1. Exploitability -> Attack Vector (AV)
    if (cvssVector.includes("AV:N")) score.exploitability = 9 // Network
    else if (cvssVector.includes("AV:A")) score.exploitability = 7 // Adjacent
    else if (cvssVector.includes("AV:L")) score.exploitability = 5 // Local
    else if (cvssVector.includes("AV:P")) score.exploitability = 2 // Physical

    // 2. Reproducibility -> Attack Complexity (AC)
    if (cvssVector.includes("AC:L")) score.reproducibility = 9 // Low complexity -> High reproducibility
    else if (cvssVector.includes("AC:H")) score.reproducibility = 4 // High complexity -> Low reproducibility

    // 3. Discoverability -> Privileges Required (PR) (Inverse relationship)
    if (cvssVector.includes("PR:N")) score.discoverability = 9 // None -> Easy to discover/exploit
    else if (cvssVector.includes("PR:L")) score.discoverability = 6 // Low
    else if (cvssVector.includes("PR:H")) score.discoverability = 3 // High

    // 4. Affected Users -> User Interaction (UI) & Scope (S)
    // If UI is None and Scope is Changed, it likely affects many users or the system broadly
    if (cvssVector.includes("UI:N")) score.affectedUsers = 8
    else if (cvssVector.includes("UI:R")) score.affectedUsers = 5

    if (cvssVector.includes("S:C")) score.affectedUsers += 2 // Scope Changed increases impact
    score.affectedUsers = Math.min(score.affectedUsers, 10)

    // 5. Damage Potential -> CIA Impact
    let impact = 0
    if (cvssVector.includes("C:H")) impact += 3.3
    else if (cvssVector.includes("C:L")) impact += 1.5

    if (cvssVector.includes("I:H")) impact += 3.3
    else if (cvssVector.includes("I:L")) impact += 1.5

    if (cvssVector.includes("A:H")) impact += 3.3
    else if (cvssVector.includes("A:L")) impact += 1.5

    score.damage = Math.min(Math.round(impact), 10)
    if (score.damage === 0) score.damage = 1 // Minimum damage

    // Calculate Total
    score.total = (score.damage + score.reproducibility + score.exploitability + score.affectedUsers + score.discoverability) / 5

    return score
}
