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
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const prisma = new PrismaClient();

const sidebarItems = [
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

export function SideNav() {
	const router = useRouter();
	async function signOut() {
		const result = await authClient.signOut();
		console.log("Sign out attempt with:", result);
		router.refresh();
	}
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="flex items-center justify-between p-4" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Welcome to E-Commerce app! </SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
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
									<DropdownMenuLabel>Account</DropdownMenuLabel>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<DropdownMenuLabel>Billing</DropdownMenuLabel>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<DropdownMenuLabel onClick={() => signOut()}>
										Sign out
									</DropdownMenuLabel>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
