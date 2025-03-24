import { ShoppingBag } from "lucide-react";

export default function UserOrdersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow">
				<div className="container max-w-4xl mx-auto py-6">
					<div className="flex items-center gap-3">
						<ShoppingBag className="h-6 w-6 text-primary" />
						<h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
					</div>
				</div>
			</div>
			<div className="container max-w-4xl mx-auto">{children}</div>
		</div>
	);
}
