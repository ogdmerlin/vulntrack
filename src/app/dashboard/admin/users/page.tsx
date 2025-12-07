'use client'

import { useEffect, useState } from "react"
import { getUsers, updateUserRole, deleteUser } from "@/app/actions/admin"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    Trash2,
    Edit2,
    Users,
    CheckCircle2,
    Server,
    Database,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Filter
} from "lucide-react"
import { useSession } from "next-auth/react"
import { UserDialog } from "@/components/admin/UserDialog"
import { InviteDialog } from "@/components/admin/InviteDialog"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export default function AdminUsersPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)

    // Modal State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)

    const itemsPerPage = 8

    useEffect(() => {
        loadUsers()
    }, [session])

    // Check for action param to open add user dialog
    useEffect(() => {
        if (searchParams.get("action") === "new") {
            setIsInviteDialogOpen(true)
        }
    }, [searchParams])

    async function loadUsers() {
        setLoading(true)
        const result = await getUsers()
        if (result.success && result.data) {
            setUsers(result.data)
        }
        setLoading(false)
    }

    // Handlers
    function handleAddUser() {
        setEditingUser(null)
        setIsDialogOpen(true)
    }

    function handleEditUser(user: any) {
        setEditingUser(user)
        setIsDialogOpen(true)
    }

    function handleDialogChange(open: boolean) {
        setIsDialogOpen(open)
        if (!open) {
            setEditingUser(null)
            // Clear route param if exists
            if (searchParams.get("action") === "new") {
                router.replace(pathname)
            }
        }
    }

    function handleSuccess() {
        loadUsers()
    }

    async function handleDelete(userId: string) {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            const result = await deleteUser(userId)
            if (result.success) {
                loadUsers()
            } else {
                alert("Failed to delete user")
            }
        }
    }

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole = roleFilter === "all" || user.role === roleFilter

        // Handle undefined status (legacy users) as ACTIVE
        const userStatus = user.status || "ACTIVE"
        const matchesStatus = statusFilter === "all" || userStatus === statusFilter

        return matchesSearch && matchesRole && matchesStatus
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, roleFilter, statusFilter])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                            <h3 className="text-3xl font-bold mt-2">{users.length || 147}</h3>
                            <p className="text-xs text-green-600 mt-1">+8 this month</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                            <h3 className="text-3xl font-bold mt-2">89</h3>
                            <p className="text-xs text-muted-foreground mt-1">61% online rate</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                            <h3 className="text-3xl font-bold mt-2">99.8%</h3>
                            <p className="text-xs text-muted-foreground mt-1">45 days no downtime</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Server className="h-5 w-5 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                            <h3 className="text-3xl font-bold mt-2">67%</h3>
                            <p className="text-xs text-muted-foreground mt-1">2.1 TB of 3.2 TB</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Database className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Management Section */}
            <Card className="border-none shadow-sm">
                <div className="p-6 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">User Management</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage user accounts, roles, and permissions
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-[400px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name, email, or role..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                    <SelectItem value="ANALYST">Security Analyst</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="w-[50px]">
                                        <Checkbox />
                                    </TableHead>
                                    <TableHead className="w-[300px]">User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <TableRow key={user.id} className="group hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={user.image || ""} />
                                                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-foreground">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={`
                                                    font-medium rounded-full px-3
                                                    ${user.role === 'ADMIN' ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}
                                                    ${user.role === 'ANALYST' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                                    ${user.role === 'VIEWER' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                                                `}
                                                >
                                                    {user.role === 'ADMIN' ? 'Administrator' :
                                                        user.role === 'ANALYST' ? 'Security Analyst' : 'Viewer'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${(user.status === 'ACTIVE' || !user.status) ? 'bg-emerald-500' :
                                                        user.status === 'INACTIVE' ? 'bg-slate-400' :
                                                            'bg-yellow-500'
                                                        }`} />
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {(user.status || 'ACTIVE').charAt(0) + (user.status || 'ACTIVE').slice(1).toLowerCase()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">2 hours ago</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {user.role === 'ADMIN' ? 'Full Access' :
                                                        user.role === 'ANALYST' ? 'Read, Write' : 'Read Only'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleDelete(user.id)}
                                                        disabled={user.id === session?.user?.id}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {filteredUsers.length > 0
                                ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredUsers.length)} of ${filteredUsers.length} users`
                                : "0 results"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <UserDialog
                open={isDialogOpen}
                onOpenChange={handleDialogChange}
                user={editingUser}
                onSuccess={handleSuccess}
            />

            <InviteDialog
                open={isInviteDialogOpen}
                onOpenChange={(open) => {
                    setIsInviteDialogOpen(open)
                    if (!open && searchParams.get("action") === "new") {
                        router.replace(pathname)
                    }
                }}
            />
        </div>
    )
}
