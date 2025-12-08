'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert, CheckCircle, BarChart, Lock, ArrowRight, Zap, Shield, FileText, Settings, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function MockupInterface() {
    const [activeTab, setActiveTab] = useState("Dashboard")

    useEffect(() => {
        const tabs = ["Dashboard", "Vulnerabilities", "Reports", "Settings"]
        let currentIndex = 0

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % tabs.length
            setActiveTab(tabs[currentIndex])
        }, 3000) // Switch every 3 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 w-full max-w-5xl rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden relative group"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-2 border-b border-border/50 flex gap-2 items-center bg-muted/20">
                <div className="h-3 w-3 rounded-full bg-red-500/80 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80 animate-pulse delay-75" />
                <div className="h-3 w-3 rounded-full bg-green-500/80 animate-pulse delay-150" />
                <div className="ml-4 h-4 w-64 bg-muted/50 rounded-full text-[10px] flex items-center px-2 text-muted-foreground">
                    vulntrack.com/{activeTab.toLowerCase()}
                </div>
            </div>
            <div className="aspect-video bg-background/80 p-4 md:p-8 flex gap-6 text-foreground overflow-hidden font-sans relative">
                {/* Sidebar Mockup */}
                <div className="w-48 hidden md:flex flex-col gap-4 border-r border-border/50 pr-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-primary">
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className="h-4 w-24 bg-foreground/10 rounded" />
                    </div>
                    <div className="space-y-1">
                        {["Dashboard", "Vulnerabilities", "Reports", "Settings"].map((item) => (
                            <div
                                key={item}
                                className={`h-8 w-full rounded flex items-center gap-3 px-2 transition-colors duration-300 ${activeTab === item ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                            >
                                <div className={`h-4 w-4 rounded ${activeTab === item ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                                <span className="text-xs font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Mockup */}
                <div className="flex-1 flex flex-col gap-6 relative">
                    <AnimatePresence mode="wait">
                        {activeTab === "Dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-6 h-full relative"
                            >
                                {/* Scanning Line Effect - Only for Dashboard */}
                                <motion.div
                                    className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.5)] z-10 pointer-events-none"
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                />

                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold">Security Overview</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            <p className="text-xs text-muted-foreground">System Online • Live Monitoring</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: "Critical Issues", value: 12, color: "text-red-500", bg: "bg-red-500/10" },
                                        { label: "Open Vulnerabilities", value: 45, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                                        { label: "Remediated", value: 128, color: "text-green-500", bg: "bg-green-500/10" }
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="rounded-lg border border-border/50 p-4 flex flex-col justify-between bg-card/50 relative overflow-hidden"
                                        >
                                            <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                                                <div className={`h-4 w-4 rounded-full ${stat.color.replace('text', 'bg')}`} />
                                            </div>
                                            <motion.div
                                                className="text-2xl font-bold"
                                                animate={{ opacity: [1, 0.5, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                            >
                                                {stat.value}
                                            </motion.div>
                                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="flex-1 rounded-lg border border-border/50 overflow-hidden flex flex-col relative">
                                    <div className="p-3 border-b border-border/50 bg-muted/10 flex justify-between items-center z-10 bg-card/50 backdrop-blur-sm">
                                        <span className="text-xs font-semibold">Live Vulnerability Feed</span>
                                        <div className="h-4 w-16 bg-muted/20 rounded" />
                                    </div>
                                    <div className="p-2 space-y-2 overflow-hidden relative h-full">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 z-10 pointer-events-none" />
                                        <motion.div
                                            animate={{ y: [0, -100] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                            className="space-y-2"
                                        >
                                            {[
                                                { title: "SQL Injection in Login", severity: "Critical", sevColor: "bg-red-500 text-red-500" },
                                                { title: "XSS in Comments", severity: "High", sevColor: "bg-orange-500 text-orange-500" },
                                                { title: "Outdated Dependency", severity: "Medium", sevColor: "bg-yellow-500 text-yellow-500" },
                                                { title: "Missing Headers", severity: "Low", sevColor: "bg-blue-500 text-blue-500" },
                                                { title: "Weak Password Policy", severity: "High", sevColor: "bg-orange-500 text-orange-500" },
                                                { title: "Open Port 22", severity: "Critical", sevColor: "bg-red-500 text-red-500" },
                                                { title: "Information Disclosure", severity: "Medium", sevColor: "bg-yellow-500 text-yellow-500" },
                                                { title: "CSRF Token Missing", severity: "High", sevColor: "bg-orange-500 text-orange-500" }
                                            ].map((row, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-2 rounded bg-muted/5 border border-border/20"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-2 w-2 rounded-full ${row.sevColor.split(' ')[0]} animate-pulse`} />
                                                        <span className="text-xs font-medium">{row.title}</span>
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${row.sevColor.replace('text', 'bg').replace('bg', 'bg-opacity-10 bg')} ${row.sevColor.split(' ')[1]}`}>
                                                        {row.severity}
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "Vulnerabilities" && (
                            <motion.div
                                key="vulnerabilities"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-4 h-full"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Vulnerability Database</h3>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-24 bg-muted/20 rounded text-[10px] flex items-center justify-center text-muted-foreground">Filter: All</div>
                                        <div className="h-8 w-8 bg-primary/20 rounded flex items-center justify-center"><Search className="h-4 w-4 text-primary" /></div>
                                    </div>
                                </div>
                                <div className="flex-1 rounded-lg border border-border/50 overflow-hidden bg-card/30 flex flex-col">
                                    <div className="grid grid-cols-4 gap-4 p-3 border-b border-border/50 bg-muted/10 text-[10px] font-semibold text-muted-foreground">
                                        <div className="col-span-2">VULNERABILITY</div>
                                        <div>SEVERITY</div>
                                        <div>STATUS</div>
                                    </div>
                                    <div className="p-2 space-y-2 flex-1 overflow-hidden">
                                        {[
                                            { title: "SQL Injection", sev: "Critical", color: "red" },
                                            { title: "XSS Attack", sev: "High", color: "orange" },
                                            { title: "Broken Auth", sev: "High", color: "orange" }
                                        ].map((vuln, i) => (
                                            <motion.div
                                                key={i}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    height: i === 1 ? "auto" : "32px",
                                                    backgroundColor: i === 1 ? "rgba(var(--primary), 0.05)" : "transparent"
                                                }}
                                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                                className={`rounded border ${i === 1 ? 'border-primary/20' : 'border-transparent'} overflow-hidden`}
                                            >
                                                <div className="grid grid-cols-4 gap-4 p-2 items-center h-8">
                                                    <div className="col-span-2 flex items-center gap-2">
                                                        <div className={`h-2 w-2 rounded-full bg-${vuln.color}-500`} />
                                                        <span className="text-xs font-medium">{vuln.title}</span>
                                                    </div>
                                                    <div className={`text-${vuln.color}-500 text-[10px]`}>{vuln.sev}</div>
                                                    <div className="text-green-500 text-[10px]">Open</div>
                                                </div>
                                                {i === 1 && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="p-3 pt-0 text-[10px] text-muted-foreground space-y-2"
                                                    >
                                                        <div className="h-px w-full bg-border/50 mb-2" />
                                                        <p><strong>Description:</strong> Reflected XSS vulnerability found in search parameter.</p>
                                                        <p><strong>Path:</strong> /api/v1/search?q=...</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <div className="px-2 py-1 rounded bg-primary/10 text-primary">Remediate</div>
                                                            <div className="px-2 py-1 rounded bg-muted">Ignore</div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "Reports" && (
                            <motion.div
                                key="reports"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-6 h-full justify-center items-center"
                            >
                                <div className="text-center space-y-2">
                                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-primary animate-bounce" />
                                    </div>
                                    <h3 className="text-lg font-bold">Generating Report...</h3>
                                    <p className="text-xs text-muted-foreground">Compiling security analysis for Q3 2025</p>
                                </div>
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>Progress</span>
                                        <span>78%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "78%" }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-4">
                                    <div className="h-24 rounded border border-border/50 bg-card/50 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                                        <div className="h-8 w-8 rounded bg-red-500/10 flex items-center justify-center"><FileText className="h-4 w-4 text-red-500" /></div>
                                        <span className="text-[10px]">PDF Report</span>
                                    </div>
                                    <div className="h-24 rounded border border-border/50 bg-card/50 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                                        <div className="h-8 w-8 rounded bg-green-500/10 flex items-center justify-center"><FileText className="h-4 w-4 text-green-500" /></div>
                                        <span className="text-[10px]">CSV Export</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "Settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-4 h-full"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-bold">System Configuration</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: "Two-Factor Authentication", state: true },
                                        { label: "Email Notifications", state: true },
                                        { label: "API Access", state: false },
                                        { label: "Dark Mode", state: true },
                                        { label: "Auto-Remediation", state: false }
                                    ].map((setting, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center justify-between p-3 rounded border border-border/50 bg-card/30"
                                        >
                                            <span className="text-sm font-medium">{setting.label}</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${setting.state ? 'bg-primary' : 'bg-muted'}`}>
                                                <motion.div
                                                    className="absolute top-1 bottom-1 w-3 h-3 rounded-full bg-white shadow-sm"
                                                    initial={{ left: setting.state ? "22px" : "4px" }}
                                                    animate={{ left: setting.state ? "22px" : "4px" }}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

export function LandingPage() {

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
            {/* Navbar */}
            <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold tracking-tight">VulnTrack</span>
                </div>
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
                    <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Get Started</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="flex flex-col items-center text-center space-y-8">


                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 max-w-4xl"
                            >
                                Master Your Security Posture with <span className="text-primary">Precision</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                            >
                                The advanced vulnerability management platform for modern security teams.
                                Score, prioritize, and remediate risks using industry-standard DREAD and STRIDE frameworks.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                            >
                                <Link href="/register">
                                    <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto shadow-xl shadow-primary/20">
                                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto backdrop-blur-sm bg-background/50">
                                        Live Demo
                                    </Button>
                                </Link>
                            </motion.div>

                            {/* Abstract UI Mockup */}
                            <MockupInterface />
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-20 bg-muted/30 border-y border-border/50">

                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to secure your assets</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                VulnTrack provides a comprehensive suite of tools to manage the entire vulnerability lifecycle.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: ShieldAlert,
                                    title: "DREAD Scoring",
                                    description: "Calculate risk with precision using Damage, Reproducibility, Exploitability, Affected Users, and Discoverability metrics."
                                },
                                {
                                    icon: Lock,
                                    title: "STRIDE Classification",
                                    description: "Categorize threats effectively: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege."
                                },
                                {
                                    icon: BarChart,
                                    title: "Advanced Reporting",
                                    description: "Generate detailed PDF and CSV reports for stakeholders with a single click. Visualize trends and metrics."
                                },
                                {
                                    icon: Zap,
                                    title: "Real-time Collaboration",
                                    description: "Discuss vulnerabilities with your team directly in the platform. Track status changes and updates instantly."
                                },
                                {
                                    icon: CheckCircle,
                                    title: "CVE Import",
                                    description: "Automatically import and score vulnerabilities from the National Vulnerability Database (NVD) and other sources."
                                },
                                {
                                    icon: Shield,
                                    title: "Role-Based Access",
                                    description: "Granular control over user permissions. Manage Admins, Analysts, and Viewers with ease."
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg hover:shadow-primary/5 group flex flex-col items-center text-center"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section id="how-it-works" className="py-20 relative overflow-hidden">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Streamlined Security Workflow</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                From discovery to remediation, VulnTrack simplifies every step of your vulnerability management process.
                            </p>
                        </div>

                        <div className="relative grid md:grid-cols-4 gap-8">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                            {[
                                { step: "01", title: "Sign Up", desc: "Create your account and set up your profile in seconds." },
                                { step: "02", title: "Discover", desc: "Import CVEs automatically or manually log vulnerabilities." },
                                { step: "03", title: "Score", desc: "Apply DREAD and STRIDE models to assess risk accurately." },
                                { step: "04", title: "Remediate", desc: "Track progress, collaborate, and generate reports." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.2 }}
                                    className="relative flex flex-col items-center text-center group"
                                >
                                    <div className="w-24 h-24 rounded-full bg-background border-4 border-muted group-hover:border-primary/50 transition-colors flex items-center justify-center z-10 mb-6 shadow-lg">
                                        <span className="text-3xl font-bold text-muted-foreground group-hover:text-primary transition-colors">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <div className="container mx-auto px-4 md:px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="max-w-3xl mx-auto space-y-8"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to elevate your security?</h2>
                            <p className="text-xl text-muted-foreground">
                                Join thousands of security professionals who trust VulnTrack to manage(Scoring, prioritization, and remediation) their vulnerabilities.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/register">
                                    <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/20">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-border/40 bg-background">
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">VulnTrack &copy; 2025</span>
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
