'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function generateSampleData() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Create sample vulnerabilities
        await prisma.vulnerability.createMany({
            data: [
                {
                    title: "SQL Injection in Login Form",
                    description: "The login form is vulnerable to SQL injection attacks due to unsanitized input.",
                    severity: "CRITICAL",
                    status: "OPEN",
                    userId: session.user.id,
                },
                {
                    title: "Outdated SSL/TLS Protocol",
                    description: "The server supports TLS 1.0 which is considered insecure.",
                    severity: "MEDIUM",
                    status: "IN_PROGRESS",
                    userId: session.user.id,
                },
                {
                    title: "Missing Security Headers",
                    description: "HSTS and X-Frame-Options headers are missing from the response.",
                    severity: "LOW",
                    status: "OPEN",
                    userId: session.user.id,
                }
            ]
        })

        // Create sample misconfigurations (using Vulnerability model for now but tagged)
        await prisma.vulnerability.createMany({
            data: [
                {
                    title: "[Misconfig] S3 Bucket Public Access",
                    description: "The 'assets' S3 bucket allows public write access.",
                    severity: "HIGH",
                    status: "OPEN",
                    userId: session.user.id,
                },
                {
                    title: "[Misconfig] Default Admin Credentials",
                    description: "The monitoring dashboard is using default credentials.",
                    severity: "CRITICAL",
                    status: "OPEN",
                    userId: session.user.id,
                }
            ]
        })

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/vulnerabilities')
        return { success: true }
    } catch (error) {
        console.error("Failed to generate sample data:", error)
        return { success: false, error: "Failed to generate data" }
    }
}
