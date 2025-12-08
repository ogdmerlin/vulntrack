'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ArrowLeft, Search, Calendar, Clock, ArrowRight } from "lucide-react"
import { blogPosts } from "@/lib/content"

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    const categories = Array.from(new Set(blogPosts.map(p => p.category)))
    const allCategories = ["All", ...categories]

    const filteredPosts = blogPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const featuredPost = blogPosts[0] // First post is featured
    const regularPosts = filteredPosts.filter(p => p.slug !== featuredPost.slug || selectedCategory !== "All")

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
                                Security Knowledge Base
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Guides, tutorials, and insights to help you secure your applications effectively.
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
                            {allCategories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
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
                                <div className="grid md:grid-cols-2 gap-8 items-start p-6 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card group">
                                    <div className="h-full flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="secondary">{featuredPost.category}</Badge>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {featuredPost.date}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-muted-foreground mb-4 text-lg">
                                            {featuredPost.excerpt}
                                        </p>
                                        <div className="flex items-center text-primary font-medium text-sm mt-auto">
                                            Read Article <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>
                                    {/* Placeholder for future image */}
                                    <div className="hidden md:flex h-full min-h-[250px] bg-muted rounded-lg items-center justify-center text-muted-foreground bg-gradient-to-br from-muted/50 to-muted">
                                        <ShieldAlert className="h-16 w-16 opacity-20" />
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
                                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                                        <article className="h-full flex flex-col p-6 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card group">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant="outline">{post.category}</Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {post.readTime}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
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
