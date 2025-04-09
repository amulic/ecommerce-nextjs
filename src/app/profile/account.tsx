import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
	User,
	Package,
	ShoppingCart,
	CreditCard,
	Settings,
	Calendar,
	Clock,
	Star,
	ChevronRight,
} from "lucide-react";

export default async function Page() {
	// Get authenticated user
	const session = await isAuthenticated();

	if (!session) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
				<h1 className="text-2xl font-bold mb-4">You are not logged in</h1>
				<p className="text-muted-foreground mb-6">
					Please sign in to view your dashboard
				</p>
				<Button asChild>
					<Link href="/login">Sign In</Link>
				</Button>
			</div>
		);
	}

	const user = session.user;

	// Get recent orders for the user (limited to 5)
	const recentOrders = await prisma.order.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
		take: 5,
		include: {
			orderItems: {
				include: {
					product: true,
				},
			},
		},
	});

	// Get review count
	const reviewCount = await prisma.review.count({
		where: { userId: user.id },
	});

	// Calculate total spend
	let totalSpend = 0;
	recentOrders.forEach((order) => {
		totalSpend += order.totalAmount;
	});

	// Format date function
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	// Get order status color
	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "delivered":
				return "bg-green-100 text-green-800";
			case "shipped":
				return "bg-blue-100 text-blue-800";
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			case "pending":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Get order count
	const orderCount = await prisma.order.count({
		where: { userId: user.id },
	});

	return (
		<div className="container py-10 space-y-8">
			{/* Header & Profile Summary */}
			<div className="flex flex-col md:flex-row justify-between items-start gap-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">Welcome back, {user.name}</p>
				</div>

				<Card className="w-full md:w-auto">
					<CardContent className="flex items-center gap-4 p-6">
						<Avatar className="h-16 w-16">
							{user.image ? (
								<AvatarImage src={user.image} alt={user.name} />
							) : (
								<AvatarFallback className="text-lg">
									{user.name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "U"}
								</AvatarFallback>
							)}
						</Avatar>

						<div>
							<h2 className="text-xl font-semibold">{user.name}</h2>
							<p className="text-sm text-muted-foreground">{user.email}</p>
							<div className="mt-2">
								<Badge variant="outline" className="mr-1">
									{user.role.charAt(0).toUpperCase() +
										user.role.slice(1).toLowerCase()}
								</Badge>
								<Badge variant="outline">
									{user.emailVerified ? "Verified" : "Unverified"}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-full">
								<Package className="h-5 w-5 text-primary" />
							</div>
							<div className="space-y-0.5">
								<p className="text-sm font-medium text-muted-foreground">
									Total Orders
								</p>
								<p className="text-2xl font-bold">{orderCount}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-full">
								<CreditCard className="h-5 w-5 text-primary" />
							</div>
							<div className="space-y-0.5">
								<p className="text-sm font-medium text-muted-foreground">
									Total Spent
								</p>
								<p className="text-2xl font-bold">${totalSpend.toFixed(2)}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-full">
								<Star className="h-5 w-5 text-primary" />
							</div>
							<div className="space-y-0.5">
								<p className="text-sm font-medium text-muted-foreground">
									Reviews
								</p>
								<p className="text-2xl font-bold">{reviewCount}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-full">
								<Calendar className="h-5 w-5 text-primary" />
							</div>
							<div className="space-y-0.5">
								<p className="text-sm font-medium text-muted-foreground">
									Member Since
								</p>
								<p className="text-xl font-bold">
									{formatDate(user.createdAt)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Orders */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Orders</CardTitle>
					<CardDescription>View your most recent purchases</CardDescription>
				</CardHeader>
				<CardContent>
					{recentOrders.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-8 text-center">
							<Package className="h-16 w-16 text-muted-foreground/60 mb-4" />
							<h3 className="text-lg font-medium">No orders yet</h3>
							<p className="text-sm text-muted-foreground mt-1 mb-4">
								When you make purchases, they will appear here
							</p>
							<Button asChild>
								<Link href="/dashboard">Start Shopping</Link>
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order ID</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Amount</TableHead>
									<TableHead className="text-right"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentOrders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-medium">
											{order.id.substring(0, 8)}...
										</TableCell>
										<TableCell>{formatDate(order.createdAt)}</TableCell>
										<TableCell>
											<Badge className={getStatusColor(order.status)}>
												{order.status.charAt(0).toUpperCase() +
													order.status.slice(1).toLowerCase()}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											${order.totalAmount.toFixed(2)}
										</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="sm" asChild>
												<Link href={`/user-orders`}>
													View <ChevronRight className="ml-1 h-4 w-4" />
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
				<CardFooter className="flex justify-between border-t px-6 py-4">
					<Button variant="outline" asChild>
						<Link href="/user-orders">View All Orders</Link>
					</Button>
					<Button asChild>
						<Link href="/dashboard">Continue Shopping</Link>
					</Button>
				</CardFooter>
			</Card>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Shortcuts to important sections</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
					<Button
						variant="outline"
						className="h-auto py-4 justify-start"
						asChild
					>
						<Link href="/shopping-cart" className="flex items-center">
							<ShoppingCart className="mr-2 h-5 w-5" />
							<div className="text-left">
								<p className="font-medium">Shopping Cart</p>
								<p className="text-xs text-muted-foreground">
									View your cart items
								</p>
							</div>
						</Link>
					</Button>

					<Button
						variant="outline"
						className="h-auto py-4 justify-start"
						asChild
					>
						<Link href="/user-orders" className="flex items-center">
							<Package className="mr-2 h-5 w-5" />
							<div className="text-left">
								<p className="font-medium">Order History</p>
								<p className="text-xs text-muted-foreground">
									View all your orders
								</p>
							</div>
						</Link>
					</Button>

					<Button
						variant="outline"
						className="h-auto py-4 justify-start"
						asChild
					>
						<Link href="#" className="flex items-center">
							<User className="mr-2 h-5 w-5" />
							<div className="text-left">
								<p className="font-medium">Account Settings</p>
								<p className="text-xs text-muted-foreground">
									Update your information
								</p>
							</div>
						</Link>
					</Button>

					<Button
						variant="outline"
						className="h-auto py-4 justify-start"
						asChild
					>
						<Link href="/dashboard" className="flex items-center">
							<Settings className="mr-2 h-5 w-5" />
							<div className="text-left">
								<p className="font-medium">Shop Products</p>
								<p className="text-xs text-muted-foreground">
									Browse all products
								</p>
							</div>
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
