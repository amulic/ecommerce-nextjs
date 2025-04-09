import { isAuthenticated } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	User,
	Package,
	ShoppingCart,
	Settings,
	Users,
	BarChart3,
	Home,
	LogOut,
} from "lucide-react";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Check authentication and admin role
	const session = await isAuthenticated();

	if (!session) {
		redirect("/login");
	}

	const user = session.user;

	if (user.role !== "ADMIN") {
		return notFound();
	}

	return (
		<div className="flex bg-gray-100">
			<div className="hidden md:flex flex-col w-full bg-white shadow-sm">
				<div className="p-4 border-b">
					<h2 className="font-semibold text-xl">Admin Panel</h2>
				</div>
				<div className="flex space-x-4 p-4 border-b overflow-x-auto">
					<Link
						href="/user-management"
						className="flex items-center p-2 rounded-lg hover:bg-gray-100"
					>
						<Users className="mr-3 h-5 w-5" />
						Users
					</Link>
					<Link
						href="/products"
						className="flex items-center p-2 rounded-lg hover:bg-gray-100"
					>
						<Package className="mr-3 h-5 w-5" />
						Products
					</Link>
					<Link
						href="/orders"
						className="flex items-center p-2 rounded-lg hover:bg-gray-100"
					>
						<ShoppingCart className="mr-3 h-5 w-5" />
						Orders
					</Link>
					<Link
						href="/analytics"
						className="flex items-center p-2 rounded-lg hover:bg-gray-100"
					>
						<BarChart3 className="mr-3 h-5 w-5" />
						Analytics
					</Link>
					<Link
						href="/settings"
						className="flex items-center p-2 rounded-lg hover:bg-gray-100"
					>
						<Settings className="mr-3 h-5 w-5" />
						Settings
					</Link>
				</div>

				{/* Main content */}
				<div className="flex-1">
					{/* Top header */}
					<header className="bg-white shadow-sm p-4 md:hidden">
						<h2 className="font-semibold">Admin Dashboard</h2>
					</header>

					{/* Page content */}
					<main className="p-6">{children}</main>
				</div>
			</div>
		</div>
	);
}
