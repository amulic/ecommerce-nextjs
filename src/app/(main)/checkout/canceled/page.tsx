"use client";

import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CheckoutCanceledPage() {
	const router = useRouter();

	return (
		<div className="container max-w-md mx-auto p-6">
			<Card className="border-none shadow-none">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<XCircle className="h-10 w-10 text-destructive" />
					</div>
					<CardTitle className="text-2xl">Checkout Canceled</CardTitle>
				</CardHeader>
				<CardContent className="text-center">
					<p className="mb-6">
						Your checkout process was canceled. Your cart items have been saved
						if you want to complete your purchase later.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<Button
						className="w-full"
						onClick={() => router.push("/shopping-cart")}
					>
						Return to Cart
					</Button>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => router.push("/dashboard")}
					>
						Continue Shopping
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
