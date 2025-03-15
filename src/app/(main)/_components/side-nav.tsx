"use client";

import { PrismaClient } from "@prisma/client";
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
	Inbox,
	Search,
	LayoutDashboard,
	ShoppingCart,
	User2,
	ChevronUp,
	UserCog,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@prisma/client";

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
];

const sidebarItemsAdmin = [
	{
		title: "User dashboard",
		url: "/user-dashboard",
		icon: UserCog,
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
				{props.user?.role === "ADMIN" && (
					<SidebarGroup>
						<SidebarGroupLabel>Admin</SidebarGroupLabel>
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
