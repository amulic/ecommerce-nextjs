import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SideNav } from "./_components/side-nav";
import type { ReactNode } from "react";
import { isAuthenticated } from "@/lib/auth";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default async function DashboardLayout({
	children,
}: DashboardLayoutProps) {
	const session = await isAuthenticated();
	const user = session?.user;

	return (
		<SidebarProvider>
			<div className="flex h-screen w-screen overflow-hidden">
				<SideNav user={user} />
				<main className="flex-1 overflow-auto">
					<SidebarTrigger className="p-4" />
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
