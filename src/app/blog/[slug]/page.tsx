'use client'

import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react"
import { blogPosts } from "@/lib/content"
import { cn } from "@/lib/utils"

// Helper to extract headings for TOC
function getHeadings(content: string) {
    const regex = /^(#{2,3})\s+(.+)$/gm
    const headings = []
    let match
    while ((match = regex.exec(content)) !== null) {
        headings.push({
            level: match[1].length,
            text: match[2],
            slug: match[2].toLowerCase().replace(/[^\w]+/g, '-')
        })
    }
    return headings
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = blogPosts.find(p => p.slug === params.slug)

    if (!post) {
        notFound()
    }

    const headings = getHeadings(post.content)

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Professional Minimal Header */}
            <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
                <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
                    <Link href="/blog" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Research
                    </Link>
                    <div className="flex items-center gap-2 font-semibold tracking-tight">
                        <ShieldAlert className="h-5 w-5" />
                        VulnTrack Research
                    </div>
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-24 md:py-32">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Main Content Column */}
                    <div className="lg:col-span-8 lg:col-start-1">
                        {/* Article Header */}
                        <div className="mb-10 pb-8 border-b border-border">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <Badge variant="outline" className="rounded-sm px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground border-border/60">
                                    {post.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    {post.date}
                                </span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    {post.readTime}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
                                {post.title}
                            </h1>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground">{post.author}</span>
                                    <span className="text-xs text-muted-foreground">{post.authorRole}</span>
                                </div>
                            </div>
                        </div>

                        {/* Article Content - "Prose" styling manually for customized control */}
                        <article className="prose prose-neutral dark:prose-invert max-w-none 
                            prose-headings:scroll-mt-24 
                            prose-headings:font-bold 
                            prose-headings:tracking-tight
                            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:pb-2 prose-h2:border-border/60
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:leading-8 prose-p:text-muted-foreground prose-p:mb-6
                            prose-li:text-muted-foreground prose-li:my-1
                            prose-strong:text-foreground prose-strong:font-semibold
                            prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none prose-code:font-normal
                            prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
                            ">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({ node, ...props }) => {
                                        const id = props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')
                                        return <h2 id={id} {...props} />
                                    },
                                    h3: ({ node, ...props }) => {
                                        const id = props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-')
                                        return <h3 id={id} {...props} />
                                    },
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-8 border rounded-md border-border">
                                            <table className="w-full text-left text-sm" {...props} />
                                        </div>
                                    ),
                                    thead: ({ node, ...props }) => <thead className="bg-muted/50 border-b border-border/60" {...props} />,
                                    th: ({ node, ...props }) => <th className="p-4 font-semibold text-foreground whitespace-nowrap" {...props} />,
                                    td: ({ node, ...props }) => <td className="p-4 border-b last:border-0 border-border/40 text-muted-foreground align-top" {...props} />,
                                    a: ({ node, ...props }) => <a className="text-primary hover:underline underline-offset-4 decoration-primary/40 hover:decoration-primary" {...props} />,
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </article>

                        {/* Article Footer */}
                        <div className="mt-16 pt-8 border-t border-border">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Topics</h4>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <div key={tag} className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground border border-border/50">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-3 lg:col-start-10 space-y-8">
                        {/* Table of Contents */}
                        <div className="sticky top-24 space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-4">
                                    Contents
                                </h3>
                                <nav className="flex flex-col border-l border-border/60">
                                    {headings.map((heading: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={`#${heading.slug}`}
                                            className={cn(
                                                "text-sm py-2 px-4 border-l -ml-px transition-colors duration-200 hover:border-foreground/40",
                                                heading.level === 3 ? "pl-8 text-muted-foreground/70 hover:text-foreground" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {heading.text}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Professional CTA */}
                            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                                <h4 className="font-semibold text-foreground mb-2">VulnTrack Platform</h4>
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                    Automate your DREAD and CVSS scoring with our comprehensive vulnerability management platform.
                                </p>
                                <Button className="w-full" size="sm">
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
