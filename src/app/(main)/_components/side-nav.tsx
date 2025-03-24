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
	SidebarRail,
} from "@/components/ui/sidebar";
import {
	Home,
	LayoutDashboard,
	ShoppingCart,
	User2,
	ChevronUp,
	UserCog,
	SquarePlus,
	Receipt,
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
	const [cartItemCount, setCartItemCount] = useState(0);

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
		},
		{
			title: "User orders",
			url: "/user-orders",
			icon: Receipt,
		},
	];

	useEffect(() => {
		async function checkCart() {
			try {
				const cartData = await getCartContents();
				const itemCount = cartData.totalItems || 0;
				setCartItemCount(itemCount);
				setCartHasItems(cartData.totalItems > 0);
			} catch (error) {
				console.error("Error fetching cart contents:", error);
			}
		}

		checkCart();

		//const intervalId = setInterval(checkCart, 6000);

		const handleCartUpdate = () => checkCart();
		window.addEventListener("cartUpdated", handleCartUpdate);

		return () => {
			//clearInterval(intervalId);
			window.removeEventListener("cartUpdated", handleCartUpdate);
		};
	}, []);

	console.log(props.user);
	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarRail />
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
											<item.icon />

											<span>{item.title}</span>
											{item.title === "Shopping cart" && cartItemCount > 0 && (
												<span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 flex items-center justify-center min-w-[1.25rem]">
													{cartItemCount}
												</span>
											)}
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
