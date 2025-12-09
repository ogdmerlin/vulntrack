'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { registerUser } from "@/app/actions/auth"

export function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
            name: formData.get("name"),
            token: token // Pass token to server action if present
        }

        const result = await registerUser(data)

        if (result.success) {
            router.push("/login?registered=true")
        } else {
            setError(result.error || "Something went wrong")
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-primary/10 p-3">
                        {token ? <UserPlus className="h-6 w-6 text-primary" /> : <ShieldAlert className="h-6 w-6 text-primary" />}
                    </div>
                </div>
                <CardTitle className="text-2xl">{token ? "Accept Invitation" : "Create an account"}</CardTitle>
                <CardDescription>
                    {token ? "Create your account to join the team" : "Enter your email below to create your account"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
                            {error}
                        </div>
                    )}

                    {/* Visual cue for invitation */}
                    {token && !error && (
                        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300 text-center border border-blue-200 dark:border-blue-800">
                            You are joining an existing workspace.
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-muted-foreground">
                            Must contain 8+ characters, uppercase, lowercase, number, and symbol.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {token ? "Join Team" : "Sign Up"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="hover:text-primary underline underline-offset-4">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
