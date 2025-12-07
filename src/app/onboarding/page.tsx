'use client'

import { useState } from "react"
import { updateProfile } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, User, CheckCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function OnboardingPage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [step, setStep] = useState(1)
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleStep1(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        setStep(2)
    }

    async function handleComplete() {
        setLoading(true)
        const result = await updateProfile({ name })
        if (result.success) {
            await update() // Update session
            router.push("/dashboard")
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to VulnTrack</CardTitle>
                    <CardDescription>Let&apos;s get your profile set up.</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <form onSubmit={handleStep1} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">What should we call you?</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="Enter your full name"
                                        className="pl-9"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={!name.trim()}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-primary/10 p-4">
                                    <CheckCircle className="h-12 w-12 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">You&apos;re all set!</h3>
                                <p className="text-muted-foreground">
                                    Your profile has been created. You can now start tracking vulnerabilities.
                                </p>
                            </div>
                            <Button onClick={handleComplete} className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Go to Dashboard
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <div className="flex gap-2">
                        <div className={`h-2 w-2 rounded-full transition-colors ${step === 1 ? "bg-primary" : "bg-muted"}`} />
                        <div className={`h-2 w-2 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-muted"}`} />
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
