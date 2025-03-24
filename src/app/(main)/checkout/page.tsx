"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createCheckoutSession } from "./_actions/checkout-actions";
import { getCartContents } from "../shopping-cart/_actions/cart-actions";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CheckoutPage() {
	const [cart, setCart] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		async function loadCart() {
			setIsLoading(true);
			const result = await getCartContents();
			if (result.success && result.cart) {
				setCart(result);
			} else {
				setError("Unable to load cart. Please try again.");
			}
			setIsLoading(false);
		}

		loadCart();
	}, []);

	const handleCheckout = async () => {
		if (!cart || cart.totalItems === 0) {
			toast.error("Your cart is empty");
			return;
		}

		setIsProcessing(true);
		setError(null);

		try {
			const result = await createCheckoutSession();

			if (result.success && result.checkoutUrl) {
				// Redirect to Polar's hosted checkout page
				window.location.href = result.checkoutUrl;
			} else {
				setError(result.message || "Failed to create checkout session");
				setIsProcessing(false);
			}
		} catch (err) {
			console.error("Checkout error:", err);
			setError("An unexpected error occurred. Please try again.");
			setIsProcessing(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-100px)]">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading checkout...</p>
				</div>
			</div>
		);
	}

	if (!cart || cart.totalItems === 0) {
		return (
			<div className="container max-w-4xl mx-auto p-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-bold">Checkout</CardTitle>
						<CardDescription>Your cart is empty</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center py-8">
						<p className="mb-6 text-center">
							Add some products to your cart before proceeding to checkout.
						</p>
						<Button onClick={() => router.push("/dashboard")}>
							Browse Products
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container max-w-6xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Checkout</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Order Details</CardTitle>
							<CardDescription>
								Review your order before proceeding
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Error</AlertTitle>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="space-y-4">
								{cart.cart.items.map((item: any) => (
									<div
										key={item.id}
										className="flex justify-between items-center py-2"
									>
										<div className="flex items-center gap-3">
											<div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
												{item.product.images?.[0] && (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={item.product.images[0]}
														alt={item.product.name}
														className="h-full w-full object-cover"
													/>
												)}
											</div>
											<div>
												<p className="font-medium">{item.product.name}</p>
												<p className="text-sm text-muted-foreground">
													Qty: {item.quantity}
												</p>
											</div>
										</div>
										<p className="font-medium">
											${(item.product.price * item.quantity).toFixed(2)}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-1">
					<Card className="sticky top-6">
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Subtotal</span>
								<span>${cart.totalPrice.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Shipping</span>
								<span>Calculated at next step</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tax</span>
								<span>Calculated at next step</span>
							</div>

							<Separator />

							<div className="flex justify-between text-lg font-semibold">
								<span>Total</span>
								<span>${cart.totalPrice.toFixed(2)}</span>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								size="lg"
								onClick={handleCheckout}
								disabled={isProcessing}
							>
								{isProcessing ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									"Proceed to Payment"
								)}
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
