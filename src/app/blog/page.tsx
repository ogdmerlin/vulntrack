'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ArrowLeft, Search, Calendar, Clock, ArrowRight, BookOpen, Layers } from "lucide-react"
import { motion } from "framer-motion"

interface BlogPost {
    id: string
    slug: string
    category: string
    title: string
    excerpt: string
    author: string
    authorRole: string
    date: string
    readTime: string
    featured?: boolean
    tags: string[]
}

const blogPosts: BlogPost[] = [
    {
        id: "1",
        slug: "getting-started-with-dread-scoring",
        category: "Tutorial",
        title: "Getting Started with DREAD Scoring: A Complete Guide",
        excerpt: "Learn to prioritize vulnerabilities using the DREAD framework - Damage, Reproducibility, Exploitability, Affected Users, and Discoverability.",
        author: "Security Team",
        authorRole: "Education",
        date: "Dec 2, 2024",
        readTime: "8 min read",
        featured: true,
        tags: ["DREAD", "Tutorial", "Risk Assessment"]
    },
    {
        id: "2",
        slug: "understanding-stride-threat-modeling",
        category: "Guide",
        title: "Understanding STRIDE Threat Modeling: Identify Threats Before They Strike",
        excerpt: "Systematically identify security threats using STRIDE - Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.",
        author: "Security Team",
        authorRole: "Education",
        date: "Dec 5, 2024",
        readTime: "10 min read",
        featured: false,
        tags: ["STRIDE", "Threat Modeling", "Security"]
    }
]

const categories = [
    { name: "All", count: blogPosts.length },
    { name: "Tutorial", count: blogPosts.filter(p => p.category === "Tutorial").length },
    { name: "Guide", count: blogPosts.filter(p => p.category === "Guide").length },
]

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    const filteredPosts = blogPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const featuredPost = blogPosts.find(p => p.featured)
    const regularPosts = filteredPosts.filter(p => !p.featured || selectedCategory !== "All")

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
                {/* Hero Section */}
                <section className="py-12 border-b border-border/50">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-3xl">
                            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Blog
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Security insights, guides, and updates from the VulnTrack team.
                            </p>

                            {/* Search */}
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search articles..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-6 border-b border-border/50">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.name}
                                    variant={selectedCategory === cat.name ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat.name)}
                                >
                                    {cat.name} ({cat.count})
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Post */}
                {featuredPost && selectedCategory === "All" && !searchQuery && (
                    <section className="py-12 border-b border-border/50">
                        <div className="container mx-auto px-4 md:px-6">
                            <h2 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Featured Article</h2>
                            <Link href={`/blog/${featuredPost.slug}`}>
                                <div className="grid md:grid-cols-1 gap-8 items-start p-6 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="secondary">{featuredPost.category}</Badge>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {featuredPost.date}
                                            </span>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {featuredPost.readTime}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-3">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-muted-foreground mb-4 max-w-2xl">
                                            {featuredPost.excerpt}
                                        </p>
                                        <div className="flex items-center text-primary font-medium text-sm">
                                            Read Article <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>
                )}

                {/* Blog Posts Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold">
                                {selectedCategory === "All" ? "Latest Articles" : selectedCategory}
                            </h2>
                        </div>

                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground">No articles found matching your search.</p>
                                <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory("All") }}>
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {regularPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`}>
                                        <article className="h-full flex flex-col p-6 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant="outline">{post.category}</Badge>
                                                <span className="text-xs text-muted-foreground">{post.readTime}</span>
                                            </div>

                                            <h3 className="text-lg font-bold mb-2 line-clamp-2">
                                                {post.title}
                                            </h3>

                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                                                {post.excerpt}
                                            </p>

                                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {post.author.charAt(0)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground">{post.author}</span>
                                                    <span className="mx-1">•</span>
                                                    {post.date}
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}
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
