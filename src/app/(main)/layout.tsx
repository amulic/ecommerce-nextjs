import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SideNav } from "./_components/side-nav";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<SidebarProvider>
			<div className="flex h-screen w-screen overflow-hidden">
				<SideNav />
				<main className="flex-1 overflow-auto">
					<SidebarTrigger className="p-4" />
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
