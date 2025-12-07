'use client'

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ArrowLeft, Calendar, Clock, Share, BookmarkPlus, ChevronRight, User, Search, Layers, ArrowRight, BookOpen, RefreshCw } from "lucide-react"

// Blog post content data
const blogPostsContent: Record<string, {
    title: string
    category: string
    date: string
    readTime: string
    author: string
    authorRole: string
    tags: string[]
    content: React.ReactNode
}> = {
    "getting-started-with-dread-scoring": {
        title: "Getting Started with DREAD Scoring: A Complete Guide",
        category: "Tutorial",
        date: "Dec 2, 2024",
        readTime: "8 min read",
        author: "Security Team",
        authorRole: "Education",
        tags: ["DREAD", "Tutorial", "Risk Assessment", "Vulnerability Scoring"],
        content: (
            <article className="prose prose-invert prose-lg max-w-none">
                <p className="lead text-xl text-muted-foreground">
                    The DREAD model is a risk assessment framework developed by Microsoft to prioritize security vulnerabilities.
                    In this guide, you will learn how to effectively use DREAD to score and prioritize vulnerabilities in your applications.
                </p>

                <h2>What is DREAD?</h2>
                <p>
                    DREAD is an acronym that stands for five key factors used to assess the severity of a security vulnerability.
                    It transforms subjective &quot;gut feelings&quot; into objective, numerical scores.
                </p>

                <div className="grid gap-4 not-prose my-8">
                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg m-0 mb-1">Damage Potential</h3>
                                <p className="text-muted-foreground text-sm m-0">How severe would an attack be? (0 = No damage, 10 = Complete destruction)</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg m-0 mb-1">Reproducibility</h3>
                                <p className="text-muted-foreground text-sm m-0">How easy is it to reproduce the attack? (0 = Impossible, 10 = Every time)</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg m-0 mb-1">Exploitability</h3>
                                <p className="text-muted-foreground text-sm m-0">How easy is it to launch an attack? (0 = Advanced skills needed, 10 = Automated)</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg m-0 mb-1">Affected Users</h3>
                                <p className="text-muted-foreground text-sm m-0">How many users would be impacted? (0 = None, 10 = All users)</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                                <Search className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg m-0 mb-1">Discoverability</h3>
                                <p className="text-muted-foreground text-sm m-0">How easy is it to find the vulnerability? (0 = Hidden, 10 = Obvious)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2>The Scoring Scale</h2>
                <p>
                    Each DREAD category is rated on a scale of <strong>1 to 10</strong>. The goal is to be consistent across your organization.
                </p>
                <div className="grid md:grid-cols-3 gap-4 not-prose my-6">
                    <div className="p-4 rounded border bg-muted/20 text-center">
                        <div className="text-2xl font-bold mb-1">1-3</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Risk</div>
                        <p className="text-xs text-muted-foreground mt-2">Minimal impact or very difficult to exploit.</p>
                    </div>
                    <div className="p-4 rounded border bg-muted/20 text-center">
                        <div className="text-2xl font-bold mb-1">4-6</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Medium Risk</div>
                        <p className="text-xs text-muted-foreground mt-2">Moderate impact or moderate difficulty.</p>
                    </div>
                    <div className="p-4 rounded border bg-muted/20 text-center">
                        <div className="text-2xl font-bold mb-1">7-10</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">High Risk</div>
                        <p className="text-xs text-muted-foreground mt-2">Severe impact or trivial to exploit.</p>
                    </div>
                </div>

                <p>
                    The final DREAD score is calculated by averaging all five categories:
                </p>

                <div className="not-prose my-6 p-6 border rounded-lg bg-muted/30 text-center">
                    <p className="font-medium text-muted-foreground mb-4 uppercase tracking-widest text-xs">The Formula</p>
                    <code className="text-2xl font-bold bg-background px-4 py-2 rounded border">
                        (D + R + E + A + D) / 5 = Risk Score
                    </code>
                </div>

                <h2>Practical Example: SQL Injection</h2>
                <p>
                    Let us score a classic SQL Injection vulnerability using DREAD to see how it works in practice.
                </p>

                <div className="not-prose border rounded-lg overflow-hidden my-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold w-24 text-center">Score</th>
                                <th className="p-4 font-semibold">Reasoning</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-4 font-medium">Damage</td>
                                <td className="p-4 text-center font-bold">9</td>
                                <td className="p-4 text-muted-foreground">Full database access, data theft, data modification possible.</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Reproducibility</td>
                                <td className="p-4 text-center font-bold">10</td>
                                <td className="p-4 text-muted-foreground">Attack works every time once the payload is crafted.</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Exploitability</td>
                                <td className="p-4 text-center font-bold">7</td>
                                <td className="p-4 text-muted-foreground">Requires knowledge of SQL, but automated tools exist.</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Affected Users</td>
                                <td className="p-4 text-center font-bold">10</td>
                                <td className="p-4 text-muted-foreground">All users in the database could be impacted.</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Discoverability</td>
                                <td className="p-4 text-center font-bold">8</td>
                                <td className="p-4 text-muted-foreground">Automated scanners can easily find basic SQL injection.</td>
                            </tr>
                            <tr className="bg-primary/5">
                                <td className="p-4 font-bold text-primary">Final Score</td>
                                <td className="p-4 text-center font-bold text-primary text-lg">8.8</td>
                                <td className="p-4 font-medium text-primary">CRITICAL Severity</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Best Practices for DREAD Scoring</h2>

                <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base m-0">Be Consistent</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Use the same criteria across all vulnerabilities to ensure comparable scores.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base m-0">Document Reasoning</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Always record why you gave each score to defend your decisions later.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base m-0">Team Consensus</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Have multiple people score independently, then discuss discrepancies.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base m-0">Re-evaluate Regularly</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Scores may change as new exploits are released or environments change.</p>
                    </div>
                </div>

                <h2>Common DREAD Scoring Pitfalls</h2>

                <div className="space-y-4 not-prose my-6">
                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex-1">
                            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-orange-500" /> Scoring Based on Exploit Availability
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="m-0"><span className="font-bold text-red-500">Wrong:</span> Giving low Exploitability because no public exploit exists yet.</p>
                                <p className="m-0"><span className="font-bold text-green-500">Right:</span> Score based on how easy it would be to create an exploit.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex-1">
                            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-orange-500" /> Ignoring Context
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="m-0"><span className="font-bold text-red-500">Wrong:</span> Using the same DREAD scores for every application.</p>
                                <p className="m-0"><span className="font-bold text-green-500">Right:</span> A low-severity bug in a blog might be critical in a banking app.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex-1">
                            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-orange-500" /> Over-Reliance on Automation
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="m-0"><span className="font-bold text-red-500">Wrong:</span> Blindly accepting scanner-generated DREAD scores.</p>
                                <p className="m-0"><span className="font-bold text-green-500">Right:</span> Use scanners as input, but manually review based on context.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2>Team Collaboration Tips</h2>
                <p>
                    DREAD scoring works best when your entire security team is aligned. Here is how to build consensus:
                </p>

                <div className="grid md:grid-cols-3 gap-4 not-prose my-6">
                    <div className="p-4 border rounded-lg bg-card text-center">
                        <div className="h-10 w-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm mb-2">Create a Guide</h3>
                        <p className="text-xs text-muted-foreground">Define what a score of &quot;9&quot; means vs &quot;10&quot; for your specific org.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card text-center">
                        <div className="h-10 w-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm mb-2">Calibration</h3>
                        <p className="text-xs text-muted-foreground">Meet monthly to review past scores and adjust criteria.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card text-center">
                        <div className="h-10 w-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                            <User className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm mb-2">Independent Scoring</h3>
                        <p className="text-xs text-muted-foreground">Score alone first to avoid groupthink, then discuss.</p>
                    </div>
                </div>

                <h2>DREAD vs CVSS</h2>
                <p>
                    While DREAD is simpler and more intuitive, CVSS (Common Vulnerability Scoring System) is the industry standard.
                    Here is a quick comparison:
                </p>

                <div className="not-prose overflow-hidden rounded-lg border my-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4 font-semibold">Aspect</th>
                                <th className="p-4 font-semibold">DREAD</th>
                                <th className="p-4 font-semibold">CVSS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-4 font-medium">Complexity</td>
                                <td className="p-4">Simple (5 factors)</td>
                                <td className="p-4">Complex (8+ metrics)</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Industry Standard</td>
                                <td className="p-4">Limited adoption</td>
                                <td className="p-4">Widely adopted</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Learning Curve</td>
                                <td className="p-4">Easy to learn</td>
                                <td className="p-4">Steeper curve</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Customization</td>
                                <td className="p-4">Very flexible</td>
                                <td className="p-4">More rigid</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Conclusion</h2>
                <p>
                    DREAD scoring provides a straightforward, effective way to prioritize vulnerabilities.
                    While it may not have the industry-wide adoption of CVSS, its simplicity makes it an excellent choice for:
                </p>
                <ul>
                    <li>Internal security assessments</li>
                    <li>Quick triage of new vulnerabilities</li>
                    <li>Teams new to vulnerability management</li>
                    <li>Organizations that need a customizable scoring system</li>
                </ul>

                <p>
                    VulnTrack supports both DREAD and CVSS scoring, making it easy to assess and prioritize
                    your vulnerabilities using the methodology that works best for your team.
                </p>

                <div className="not-prose mt-8 p-6 border border-border rounded">
                    <h4 className="font-semibold text-lg mb-2">Ready to start scoring vulnerabilities?</h4>
                    <p className="text-muted-foreground mb-4">Try VulnTrack free and apply DREAD scoring to your security assessments.</p>
                    <Link href="/register">
                        <Button>Get Started Free <ChevronRight className="ml-1 h-4 w-4" /></Button>
                    </Link>
                </div>
            </article>
        )
    },
    "understanding-stride-threat-modeling": {
        title: "Understanding STRIDE Threat Modeling: Identify Threats Before They Strike",
        category: "Guide",
        date: "Dec 5, 2024",
        readTime: "12 min read",
        author: "Security Team",
        authorRole: "Education",
        tags: ["STRIDE", "Threat Modeling", "Security", "Framework"],
        content: (
            <article className="prose prose-invert prose-lg max-w-none">
                <p className="lead text-xl text-muted-foreground">
                    STRIDE is a threat modeling framework that helps you systematically identify security threats in your application.
                    Learn how to use STRIDE to think like an attacker and build more secure software.
                </p>

                <h2>What is STRIDE?</h2>
                <p>
                    STRIDE was developed by Microsoft as a mnemonic for security threats.
                    It categorizes threats into six distinct types, each representing a different vector of attack:
                </p>

                <div className="grid md:grid-cols-2 gap-4 not-prose my-8">
                    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded bg-primary/10 text-primary">
                                <User className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-base m-0">Spoofing</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Pretending to be someone or something else.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded bg-primary/10 text-primary">
                                <Layers className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-base m-0">Tampering</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Modifying data or code without authorization.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded bg-primary/10 text-primary">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-base m-0">Repudiation</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Denying having performed an action.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded bg-primary/10 text-primary">
                                <Search className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-base m-0">Information Disclosure</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Exposing data to unauthorized parties.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded bg-primary/10 text-primary">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-base m-0">Denial of Service</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Making a system unavailable.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded bg-primary/10 text-primary">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-base m-0">Elevation of Privilege</h3>
                        </div>
                        <p className="text-sm text-muted-foreground m-0">Gaining unauthorized permissions.</p>
                    </div>
                </div>

                <div className="space-y-12 my-12">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">S</div>
                            <h2 className="m-0 border-none">Spoofing Identity</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Spoofing occurs when an attacker pretends to be someone or something else, directly violating authentication.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 not-prose">
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" /> Attack Examples
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">• Using stolen credentials to log in</li>
                                    <li className="flex items-start gap-2">• Forging email headers (phishing)</li>
                                    <li className="flex items-start gap-2">• IP address spoofing</li>
                                    <li className="flex items-start gap-2">• DNS spoofing / cache poisoning</li>
                                </ul>
                            </div>
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-green-500" /> Key Mitigations
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">✓ Strong authentication (MFA)</li>
                                    <li className="flex items-start gap-2">✓ Digital signatures (DKIM/SPF)</li>
                                    <li className="flex items-start gap-2">✓ Certificate pinning</li>
                                    <li className="flex items-start gap-2">✓ Strict API key validation</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">T</div>
                            <h2 className="m-0 border-none">Tampering with Data</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Tampering involves modifying data or code in an unauthorized way, violating system integrity.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 not-prose">
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" /> Attack Examples
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">• Modifying database records directly</li>
                                    <li className="flex items-start gap-2">• Man-in-the-middle attacks</li>
                                    <li className="flex items-start gap-2">• Changing configuration files</li>
                                    <li className="flex items-start gap-2">• XSS (Cross Site Scripting)</li>
                                </ul>
                            </div>
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-green-500" /> Key Mitigations
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">✓ Rigorous input validation</li>
                                    <li className="flex items-start gap-2">✓ Parameterized queries</li>
                                    <li className="flex items-start gap-2">✓ Digital signatures / Checksums</li>
                                    <li className="flex items-start gap-2">✓ HTTPS/TLS encryption</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">R</div>
                            <h2 className="m-0 border-none">Repudiation</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Repudiation threats allow users to deny having performed actions, violating non-repudiation.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 not-prose">
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" /> Attack Examples
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">• User denies making a transaction</li>
                                    <li className="flex items-start gap-2">• Admin denies deleting records</li>
                                    <li className="flex items-start gap-2">• Lack of proof for sensitive access</li>
                                </ul>
                            </div>
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-green-500" /> Key Mitigations
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">✓ Comprehensive audit logging</li>
                                    <li className="flex items-start gap-2">✓ Digital signatures</li>
                                    <li className="flex items-start gap-2">✓ Trusted timestamping</li>
                                    <li className="flex items-start gap-2">✓ Write-only log storage</li>
                                </ul>
                            </div>
                        </div>
                    </section>


                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">I</div>
                            <h2 className="m-0 border-none">Information Disclosure</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Information disclosure exposes data to unauthorized individuals, violating confidentiality.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 not-prose">
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" /> Attack Examples
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">• Exposing error messages with stack traces</li>
                                    <li className="flex items-start gap-2">• Leaking user data via API</li>
                                    <li className="flex items-start gap-2">• Directory listing enabled</li>
                                    <li className="flex items-start gap-2">• Sensitive data in logs</li>
                                </ul>
                            </div>
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-green-500" /> Key Mitigations
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">✓ Encryption at rest and in transit</li>
                                    <li className="flex items-start gap-2">✓ Proper access controls (ACLs)</li>
                                    <li className="flex items-start gap-2">✓ Generic error messages</li>
                                    <li className="flex items-start gap-2">✓ Data masking / Redaction</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">D</div>
                            <h2 className="m-0 border-none">Denial of Service</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            DoS attacks aim to make your system unavailable to legitimate users, violating availability.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 not-prose">
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" /> Attack Examples
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">• Flooding servers with requests (DDoS)</li>
                                    <li className="flex items-start gap-2">• Resource exhaustion (CPU/RAM)</li>
                                    <li className="flex items-start gap-2">• XML Bomb (Billion Laughs)</li>
                                    <li className="flex items-start gap-2">• Application logic loops</li>
                                </ul>
                            </div>
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-green-500" /> Key Mitigations
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">✓ Rate limiting & Throttling</li>
                                    <li className="flex items-start gap-2">✓ Load balancing / CDN</li>
                                    <li className="flex items-start gap-2">✓ Resource quotas & timeouts</li>
                                    <li className="flex items-start gap-2">✓ Input size limits</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">E</div>
                            <h2 className="m-0 border-none">Elevation of Privilege</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            This occurs when users gain access to resources or functions they are not authorized for.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 not-prose">
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" /> Attack Examples
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">• Exploiting buffer overflows for root</li>
                                    <li className="flex items-start gap-2">• IDOR (Insecure Direct Object Reference)</li>
                                    <li className="flex items-start gap-2">• Docker container breakout</li>
                                    <li className="flex items-start gap-2">• Misconfigured permissions</li>
                                </ul>
                            </div>
                            <div className="bg-muted/30 p-5 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-green-500" /> Key Mitigations
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">✓ Principle of Least Privilege</li>
                                    <li className="flex items-start gap-2">✓ Role-Based Access Control (RBAC)</li>
                                    <li className="flex items-start gap-2">✓ Secure Session Management</li>
                                    <li className="flex items-start gap-2">✓ Input sanitization</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>

                <h2>Real-World Attack Patterns</h2>

                <div className="grid gap-6 not-prose my-8">
                    <div className="p-6 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded text-primary mt-1">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">SolarWinds Supply Chain Attack (Spoofing)</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Attackers inserted malicious code into SolarWinds Orion updates, spoofing legitimate software packages.
                                    Over 18,000 organizations downloaded and installed the compromised updates.
                                </p>
                                <Badge variant="outline" className="text-xs">Supply Chain</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded text-primary mt-1">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">NotPetya Ransomware (Tampering)</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    NotPetya tampered with system boot records and encrypted files, causing $10 billion in global damages.
                                    It spread through a compromised Ukrainian accounting software update.
                                </p>
                                <Badge variant="outline" className="text-xs">Ransomware</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded text-primary mt-1">
                                <Search className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Equifax Data Breach (Information Disclosure)</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Unpatched Apache Struts vulnerability led to the disclosure of personal information of 147 million people.
                                    Attackers accessed names, Social Security numbers, birth dates, and credit card numbers.
                                </p>
                                <Badge variant="outline" className="text-xs">Data Breach</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <h2>Running a STRIDE Threat Modeling Workshop</h2>

                <div className="not-prose space-y-4 my-8">
                    <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                        <div>
                            <h4 className="font-bold mb-1">Preparation</h4>
                            <p className="text-sm text-muted-foreground">Gather architecture diagrams (data flow, components). Identify stakeholders. Schedule 2-3 hours.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                        <div>
                            <h4 className="font-bold mb-1">Map Your System</h4>
                            <p className="text-sm text-muted-foreground">Draw data flow diagrams. Identify trust boundaries (internet → web server → DB).</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                        <div>
                            <h4 className="font-bold mb-1">Apply STRIDE</h4>
                            <p className="text-sm text-muted-foreground">Go component by component. Ask &quot;How can I Spoof this? Tamper with this?&quot; Capture every threat.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                        <div>
                            <h4 className="font-bold mb-1">Prioritize & Plan</h4>
                            <p className="text-sm text-muted-foreground">Score threats (e.g., using DREAD). Create action items for high-priority risks.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                        <div>
                            <h4 className="font-bold mb-1">Document & Follow Up</h4>
                            <p className="text-sm text-muted-foreground">Share the threat model. Track mitigations in your secure SDLC process.</p>
                        </div>
                    </div>
                </div>

                <h2>STRIDE vs DREAD: When to Use Each</h2>

                <div className="not-prose overflow-hidden rounded-lg border my-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4 font-semibold">Purpose</th>
                                <th className="p-4 font-semibold">STRIDE</th>
                                <th className="p-4 font-semibold">DREAD</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-4 font-medium">Main Use</td>
                                <td className="p-4">Threat identification (Brainstorming)</td>
                                <td className="p-4">Risk prioritization (Scoring)</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">When to Use</td>
                                <td className="p-4">Design phase, before code is written</td>
                                <td className="p-4">After discovery, during triage</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Output</td>
                                <td className="p-4">List of potential threats</td>
                                <td className="p-4">Numerical risk score</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Best For</td>
                                <td className="p-4">Completeness, coverage</td>
                                <td className="p-4">Prioritization, resource allocation</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    <strong>Recommended Approach:</strong> Use STRIDE first to identify all potential threats, then use DREAD to score
                    and prioritize them. This gives you comprehensive coverage with actionable prioritization.
                </p>

                <h2>Conclusion</h2>
                <p>
                    STRIDE is an essential tool in any security professional toolkit. By systematically thinking through
                    each threat category, you can identify vulnerabilities that might otherwise be missed.
                </p>
                <p>
                    Remember: threat modeling is not a one-time activity. As your application evolves, so do the threats.
                    Regular STRIDE analysis should be part of your SDLC.
                </p>

                <div className="not-prose mt-8 p-6 border border-border rounded">
                    <h4 className="font-semibold text-lg mb-2">Start Modeling Threats Today</h4>
                    <p className="text-muted-foreground mb-4">VulnTrack supports STRIDE classification for all your vulnerabilities.</p>
                    <Link href="/register">
                        <Button>Try VulnTrack Free <ChevronRight className="ml-1 h-4 w-4" /></Button>
                    </Link>
                </div>
            </article >
        )
    }
}

export default function BlogPostPage() {
    const params = useParams()
    const slug = params.slug as string
    const post = blogPostsContent[slug]

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
                    <Link href="/blog">
                        <Button>Back to Blog</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Navbar */}
            <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <Link href="/" className="flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold tracking-tight">VulnTrack</span>
                </Link>
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
                    <Link href="/blog" className="text-primary">Blog</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="py-12 border-b border-border/50">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>

                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline">{post.category}</Badge>
                            {post.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-muted-foreground">{tag}</Badge>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="font-bold text-primary">{post.author.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{post.author}</p>
                                    <p className="text-xs">{post.authorRole}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {post.date}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {post.readTime}
                            </div>
                            <div className="flex-1" />
                            <Button variant="outline" size="sm">
                                <Share className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm">
                                <BookmarkPlus className="mr-2 h-4 w-4" />
                                Save
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                        {post.content}
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-border/40 bg-background">
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">VulnTrack &copy; 2024</span>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
