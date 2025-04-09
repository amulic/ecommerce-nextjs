import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
	User,
	MoreHorizontal,
	UserPlus,
	Mail,
	Shield,
	Search,
	UserX,
	UserCheck,
	RefreshCw,
	Filter,
} from "lucide-react";

export default async function UserManagementPage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	// Get authenticated user and check if admin
	const session = await isAuthenticated();

	if (!session) {
		redirect("/login");
	}

	const user = session.user;

	if (user.role !== "ADMIN") {
		return notFound();
	}

	// Extract search parameters
	const searchQuery =
		typeof searchParams.search === "string" ? searchParams.search : "";
	const roleFilter =
		typeof searchParams.role === "string" ? searchParams.role : "";
	const page =
		typeof searchParams.page === "string"
			? Number.parseInt(searchParams.page)
			: 1;
	const perPage = 10;

	// Construct filter
	const filter: any = {};

	if (searchQuery) {
		filter.OR = [
			{ name: { contains: searchQuery, mode: "insensitive" } },
			{ email: { contains: searchQuery, mode: "insensitive" } },
		];
	}

	if (roleFilter && ["ADMIN", "USER", "EMPLOYEE"].includes(roleFilter)) {
		filter.role = roleFilter;
	}

	// Get total count for pagination
	const totalUsers = await prisma.user.count({
		where: filter,
	});

	const totalPages = Math.ceil(totalUsers / perPage);

	// Get users with pagination
	const users = await prisma.user.findMany({
		where: filter,
		orderBy: { createdAt: "desc" },
		skip: (page - 1) * perPage,
		take: perPage,
		include: {
			orders: {
				select: {
					id: true,
				},
			},
			reviews: {
				select: {
					id: true,
				},
			},
		},
	});

	// Format date
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	// Get status badge color
	const getStatusColor = (verified: boolean) => {
		return verified
			? "bg-green-100 text-green-800"
			: "bg-yellow-100 text-yellow-800";
	};

	// Get role badge color
	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "ADMIN":
				return "bg-purple-100 text-purple-800";
			case "EMPLOYEE":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="container py-10 space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">User Management</h1>
				<p className="text-muted-foreground">
					Manage user accounts, roles and permissions
				</p>
			</div>

			{/* Filters and actions */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4 justify-between">
						<div className="flex gap-4 flex-1 flex-col sm:flex-row">
							{/* Search */}
							<div className="relative flex-1">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<form>
									<Input
										type="search"
										name="search"
										placeholder="Search by name or email..."
										className="pl-8 w-full"
										defaultValue={searchQuery}
									/>
								</form>
							</div>

							{/* Role filter */}
							<form className="flex-shrink-0 w-full sm:w-[180px]">
								<Select name="role" defaultValue={roleFilter}>
									<SelectTrigger>
										<SelectValue placeholder="Filter by role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">All Roles</SelectItem>
										<SelectItem value="ADMIN">Administrators</SelectItem>
										<SelectItem value="EMPLOYEE">Employees</SelectItem>
										<SelectItem value="USER">Regular Users</SelectItem>
									</SelectContent>
								</Select>
								<Button
									type="submit"
									variant="ghost"
									size="sm"
									className="mt-2 sm:hidden w-full"
								>
									<Filter className="h-4 w-4 mr-2" />
									Apply Filters
								</Button>
							</form>
						</div>

						{/* Add user button */}
						<Button className="flex-shrink-0">
							<UserPlus className="h-4 w-4 mr-2" />
							Add User
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Users table */}
			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
					<CardDescription>
						{totalUsers} total user{totalUsers !== 1 ? "s" : ""}
						{searchQuery && ` matching "${searchQuery}"`}
						{roleFilter && ` with role ${roleFilter.toLowerCase()}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Orders</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-10">
										<div className="flex flex-col items-center justify-center text-center">
											<UserX className="h-10 w-10 text-muted-foreground mb-2" />
											<h3 className="font-medium text-lg">No users found</h3>
											<p className="text-sm text-muted-foreground mb-4">
												{searchQuery || roleFilter
													? "Try adjusting your filters"
													: "No users have been created yet"}
											</p>
											{(searchQuery || roleFilter) && (
												<Button variant="outline" asChild>
													<Link href="/user-management">
														<RefreshCw className="h-4 w-4 mr-2" />
														Reset Filters
													</Link>
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							) : (
								users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											{user.name || "—"}
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge className={getRoleBadgeColor(user.role)}>
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(user.emailVerified)}>
												{user.emailVerified ? "Verified" : "Unverified"}
											</Badge>
										</TableCell>
										<TableCell>{user.orders.length}</TableCell>
										<TableCell>{formatDate(user.createdAt)}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
														<span className="sr-only">Open menu</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuItem>
														<User className="h-4 w-4 mr-2" />
														View profile
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Mail className="h-4 w-4 mr-2" />
														Send email
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem>
														<Shield className="h-4 w-4 mr-2" />
														Change role
													</DropdownMenuItem>
													<DropdownMenuItem className="text-red-600">
														<UserX className="h-4 w-4 mr-2" />
														Deactivate account
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
				{totalPages > 1 && (
					<CardFooter className="flex items-center justify-between border-t px-6 py-4">
						<div className="text-sm text-muted-foreground">
							Showing{" "}
							<span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
							<span className="font-medium">
								{Math.min(page * perPage, totalUsers)}
							</span>{" "}
							of <span className="font-medium">{totalUsers}</span> users
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={page <= 1}
								asChild={page > 1}
							>
								{page > 1 ? (
									<Link
										href={`/user-management?page=${page - 1}${searchQuery ? `&search=${searchQuery}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
									>
										Previous
									</Link>
								) : (
									"Previous"
								)}
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={page >= totalPages}
								asChild={page < totalPages}
							>
								{page < totalPages ? (
									<Link
										href={`/user-management?page=${page + 1}${searchQuery ? `&search=${searchQuery}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
									>
										Next
									</Link>
								) : (
									"Next"
								)}
							</Button>
						</div>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
