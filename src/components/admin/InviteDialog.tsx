"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check, Info } from "lucide-react"

const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.string(),
})

interface InviteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
    const [loading, setLoading] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const form = useForm<z.infer<typeof inviteSchema>>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: "",
            role: "VIEWER",
        },
    })

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset state when closing
            form.reset()
            setInviteLink(null)
            setCopied(false)
        }
        onOpenChange(newOpen)
    }

    async function onSubmit(values: z.infer<typeof inviteSchema>) {
        setLoading(true)
        try {
            const { createInvitation } = await import("@/app/actions/admin")
            const result = await createInvitation(values.email, values.role)

            if (result.success && result.data) {
                // Construct full URL
                const origin = window.location.origin
                setInviteLink(`${origin}${result.data.link}`)
            } else {
                form.setError("root", { message: result.error || "Failed to create invitation" })
            }
        } catch (error) {
            console.error(error)
            form.setError("root", { message: "An unexpected error occurred." })
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                        Generate a secure invitation link for a new team member.
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="colleague@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ADMIN">Administrator</SelectItem>
                                                <SelectItem value="ANALYST">Analyst</SelectItem>
                                                <SelectItem value="VIEWER">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.formState.errors.root && (
                                <div className="text-sm text-destructive">{form.formState.errors.root.message}</div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex gap-2 text-sm text-blue-700 dark:text-blue-300">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p>The user will need this link to create their account and set their own password.</p>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate Link
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Invitation Link</div>
                            <div className="flex items-center gap-2">
                                <Input value={inviteLink} readOnly className="font-mono text-xs bg-muted" />
                                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Share this link with <strong>{form.getValues("email")}</strong>. It will expire in 24 hours.
                        </div>

                        <DialogFooter>
                            <Button onClick={() => handleOpenChange(false)}>
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
