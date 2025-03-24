"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { clearCart } from "../../shopping-cart/_actions/cart-actions";

export default function CheckoutSuccessPage() {
	const [isLoading, setIsLoading] = useState(true);
	const searchParams = useSearchParams();
	const router = useRouter();
	const sessionId = searchParams.get("sessionId");

	useEffect(() => {
		async function handleSuccess() {
			// Clear the cart since checkout was successful
			await clearCart();

			// Dispatch cart updated event
			window.dispatchEvent(new Event("cartUpdated"));

			setIsLoading(false);
		}

		if (sessionId) {
			handleSuccess();
		} else {
			setIsLoading(false);
		}
	}, [sessionId]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-100px)]">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Processing your order...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-md mx-auto p-6">
			<Card className="border-none shadow-none">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<CheckCircle className="h-10 w-10 text-primary" />
					</div>
					<CardTitle className="text-2xl">Order Successful!</CardTitle>
				</CardHeader>
				<CardContent className="text-center">
					<p className="mb-4">
						Thank you for your purchase. Your order has been successfully placed
						and is now being processed.
					</p>
					<p className="text-sm text-muted-foreground mb-6">
						Order confirmation and details have been sent to your email.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<Button className="w-full" onClick={() => router.push("/dashboard")}>
						Continue Shopping
					</Button>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => router.push("/account/orders")}
					>
						View My Orders
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
