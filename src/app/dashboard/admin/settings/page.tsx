'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Settings, Shield, Bell, Key, Globe, Save, Loader2, CheckCircle2 } from "lucide-react"

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    // General Settings
    const [siteName, setSiteName] = useState("VulnTrack")
    const [timezone, setTimezone] = useState("UTC")

    // Security Settings
    const [sessionTimeout, setSessionTimeout] = useState("60")
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
    const [passwordExpiry, setPasswordExpiry] = useState("90")

    // Notification Settings
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [criticalAlerts, setCriticalAlerts] = useState(true)
    const [weeklyDigest, setWeeklyDigest] = useState(false)

    async function handleSave() {
        setLoading(true)
        // Simulate save - in production, this would call a server action
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoading(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="space-y-6">
            {/* Save Toast */}
            {saved && (
                <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center gap-2 bg-green-600 text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    Settings saved successfully
                </div>
            )}

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>General Settings</CardTitle>
                    </div>
                    <CardDescription>Configure basic application settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input
                                id="siteName"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                    <SelectItem value="Europe/Paris">Central European (CET)</SelectItem>
                                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Security Settings</CardTitle>
                    </div>
                    <CardDescription>Manage security and authentication options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                            <Input
                                id="sessionTimeout"
                                type="number"
                                value={sessionTimeout}
                                onChange={(e) => setSessionTimeout(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Inactive sessions will be logged out after this period
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                            <Input
                                id="passwordExpiry"
                                type="number"
                                value={passwordExpiry}
                                onChange={(e) => setPasswordExpiry(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Users will be prompted to change password after this period
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                                Require 2FA for all admin accounts
                            </p>
                        </div>
                        <Switch
                            checked={twoFactorEnabled}
                            onCheckedChange={setTwoFactorEnabled}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Notification Settings</CardTitle>
                    </div>
                    <CardDescription>Configure email and alert preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Send email notifications for vulnerability updates
                            </p>
                        </div>
                        <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Critical Vulnerability Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Immediate alerts for critical severity vulnerabilities
                            </p>
                        </div>
                        <Switch
                            checked={criticalAlerts}
                            onCheckedChange={setCriticalAlerts}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Weekly Digest</Label>
                            <p className="text-sm text-muted-foreground">
                                Send weekly summary of vulnerability status
                            </p>
                        </div>
                        <Switch
                            checked={weeklyDigest}
                            onCheckedChange={setWeeklyDigest}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg">
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Settings
                </Button>
            </div>
        </div>
    )
}
