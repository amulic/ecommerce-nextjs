"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	Home,
	LayoutDashboard,
	ShoppingCart,
	User2,
	ChevronUp,
	UserCog,
	SquarePlus,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { getCartContents } from "../shopping-cart/_actions/cart-actions";

const sidebarItemsAdmin = [
	{
		title: "User dashboard",
		url: "/user-dashboard",
		icon: UserCog,
	},
];

const sidebarItemsEmployee = [
	{
		title: "Add products to store",
		url: "/add-product",
		icon: SquarePlus,
	},
];

export function SideNav(props: {
	user?: User;
}) {
	const router = useRouter();
	const pathname = usePathname();
	async function signOut() {
		const result = await authClient.signOut();
		console.log("Sign out attempt with:", result);
		router.refresh();
	}

	const [cartHasItems, setCartHasItems] = useState(false);

	const sidebarItemsUser = [
		{
			title: "Home",
			url: "/home",
			icon: Home,
		},
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			title: "Shopping cart",
			url: "/shopping-cart",
			icon: ShoppingCart,
			hasNotification: cartHasItems, // Now property is defined based on state
		},
	];

	useEffect(() => {
		async function checkCart() {
			try {
				const cartData = await getCartContents();
				setCartHasItems(cartData.totalItems > 0);
			} catch (error) {
				console.error("Error fetching cart contents:", error);
			}
		}

		checkCart();

		const intervalId = setInterval(checkCart, 6000);

		const handleCartUpdate = () => checkCart();
		window.addEventListener("cartUpdated", handleCartUpdate);

		return () => {
			clearInterval(intervalId);
			window.removeEventListener("cartUpdated", handleCartUpdate);
		};
	}, []);

	console.log(props.user);
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="flex items-center justify-between p-4" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Welcome to E-Commerce app! </SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarItemsUser.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link
											href={item.url}
											className="flex items-center gap-2 relative"
										>
											<div className="relative">
												<item.icon />
												{item.hasNotification && (
													<span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2" />
												)}
											</div>
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				{props.user?.role === "ADMIN" && (
					<SidebarGroup>
						<SidebarGroupLabel>Admin options</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{sidebarItemsAdmin.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={pathname === item.url}>
											<Link href={item.url} className="flex items-center gap-2">
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
				{props.user?.role === "ADMIN" && (
					<SidebarGroup>
						<SidebarGroupLabel>Employee options</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{sidebarItemsEmployee.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={pathname === item.url}>
											<Link href={item.url} className="flex items-center gap-2">
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<User2 /> Username
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem>
									<span>Account</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Billing</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={signOut}>
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
