"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	clearCart,
	getCartContents,
	removeFromCart,
	updateCartItemQuantity,
} from "./_actions/cart-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Trash,
	ShoppingBag,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Types based on your Prisma schema
type CartWithItems = {
	id: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	items: {
		id: string;
		quantity: number;
		product: {
			id: string;
			name: string;
			price: number;
			images: string[];
			// Other product fields
		};
	}[];
};

export default function ShoppingCart() {
	const [cart, setCart] = useState<CartWithItems | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPrice, setTotalPrice] = useState(0);
	const [isProcessing, setIsProcessing] = useState<string | null>(null);
	const router = useRouter();

	// Fetch cart data
	const fetchCart = async () => {
		setIsLoading(true);
		const result = await getCartContents();

		if (result.success && result.cart) {
			setCart(result.cart);
			setTotalItems(result.totalItems);
			setTotalPrice(result.totalPrice);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchCart();
	}, []);

	// Handle quantity update with optimistic UI
	const handleUpdateQuantity = async (
		productId: string,
		newQuantity: number,
	) => {
		setIsProcessing(productId);

		// Optimistic update
		const oldCart = cart as CartWithItems;

		if (cart) {
			const updatedItems = cart.items.map((item) =>
				item.product.id === productId
					? { ...item, quantity: newQuantity }
					: item,
			);

			const updatedCart = {
				...cart,
				items:
					newQuantity <= 0
						? cart.items.filter((item) => item.product.id !== productId)
						: updatedItems,
			};

			setCart(updatedCart);

			// Recalculate totals
			setTotalItems(
				updatedCart.items.reduce((sum, item) => sum + item.quantity, 0),
			);
			setTotalPrice(
				updatedCart.items.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0,
				),
			);
		}

		// Server update
		const result = await updateCartItemQuantity(productId, newQuantity);

		if (!result.success) {
			// Revert on failure
			setCart(oldCart);
			toast.error(result.message || "Failed to update quantity");
			fetchCart(); // Refresh with server data
		}

		setIsProcessing(null);
	};

	// Handle item removal
	const handleRemoveItem = async (productId: string) => {
		setIsProcessing(productId);

		// Optimistic update
		const oldCart = cart as CartWithItems;

		if (cart) {
			const updatedItems = cart.items.filter(
				(item) => item.product.id !== productId,
			);

			const updatedCart = { ...cart, items: updatedItems };
			setCart(updatedCart);

			// Recalculate totals
			setTotalItems(updatedItems.reduce((sum, item) => sum + item.quantity, 0));
			setTotalPrice(
				updatedItems.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0,
				),
			);
		}

		// Server update
		const result = await removeFromCart(productId);

		window.dispatchEvent(new Event("cartUpdated"));

		if (!result.success) {
			// Revert on failure
			setCart(oldCart);
			toast.error("Failed to remove item");
			fetchCart(); // Refresh with server data
		}

		setIsProcessing(null);
	};

	// Handle clear cart
	const handleClearCart = async () => {
		const oldCart = cart as CartWithItems;

		// Optimistic update
		setCart({ ...cart, items: [] } as CartWithItems);
		setTotalItems(0);
		setTotalPrice(0);

		// Server update
		const result = await clearCart();

		if (!result.success) {
			// Revert on failure
			setCart(oldCart);
			toast.error("Failed to clear cart");
			fetchCart(); // Refresh with server data
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-100px)]">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading your cart...</p>
				</div>
			</div>
		);
	}

	if (!cart || cart.items.length === 0) {
		return (
			<div className="container max-w-4xl mx-auto p-6">
				<Card className="border-none shadow-none bg-transparent">
					<CardHeader>
						<CardTitle className="text-3xl font-bold">Shopping Cart</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<div className="bg-muted p-4 rounded-full mb-4">
							<ShoppingBag className="h-12 w-12 text-muted-foreground" />
						</div>
						<h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
						<p className="text-muted-foreground mb-8 text-center max-w-md">
							Looks like you haven't added any products to your cart yet.
						</p>
						<Button onClick={() => router.push("/dashboard")} size="lg">
							Browse Products
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container max-w-6xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Shopping Cart</h1>
				<Badge variant="outline" className="px-3 py-1.5 text-sm">
					{totalItems} {totalItems === 1 ? "item" : "items"}
				</Badge>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader className="px-6 py-4 border-b">
							<CardTitle className="text-lg">Cart Items</CardTitle>
						</CardHeader>
						<CardContent className="p-0 divide-y">
							{cart.items.map((item) => (
								<div
									key={item.id}
									className="py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
								>
									<div className="flex items-center gap-4">
										<div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
											{item.product.images?.[0] ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={item.product.images[0]}
													alt={item.product.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="h-full w-full flex items-center justify-center">
													<ShoppingBag className="h-6 w-6 text-muted-foreground" />
												</div>
											)}
										</div>
										<div>
											<h3 className="font-medium line-clamp-1">
												{item.product.name}
											</h3>
											<p className="text-sm text-muted-foreground">
												${item.product.price.toFixed(2)} each
											</p>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
										<div className="flex items-center border rounded-md overflow-hidden">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 rounded-none"
												onClick={() =>
													handleUpdateQuantity(
														item.product.id,
														item.quantity - 1,
													)
												}
												disabled={!!isProcessing}
											>
												<ChevronLeft className="h-4 w-4" />
											</Button>
											<div className="w-10 text-center text-sm font-medium">
												{item.quantity}
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 rounded-none"
												onClick={() =>
													handleUpdateQuantity(
														item.product.id,
														item.quantity + 1,
													)
												}
												disabled={!!isProcessing}
											>
												<ChevronRight className="h-4 w-4" />
											</Button>
										</div>

										<div className="flex flex-col items-end">
											<div className="font-medium">
												${(item.product.price * item.quantity).toFixed(2)}
											</div>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 text-destructive hover:text-destructive"
												onClick={() => handleRemoveItem(item.product.id)}
												disabled={!!isProcessing}
											>
												{isProcessing === item.product.id ? (
													<Loader2 className="h-3 w-3 animate-spin mr-1" />
												) : (
													<Trash className="h-3 w-3 mr-1" />
												)}
												Remove
											</Button>
										</div>
									</div>
								</div>
							))}
						</CardContent>
						<CardFooter className="flex justify-between pt-4 pb-6 px-6 border-t">
							<Button
								variant="outline"
								onClick={handleClearCart}
								className="text-destructive"
								disabled={!!isProcessing}
							>
								<Trash className="h-4 w-4 mr-2" />
								Clear Cart
							</Button>

							<Button
								variant="outline"
								onClick={() => router.push("/shop")}
								disabled={!!isProcessing}
							>
								Continue Shopping
							</Button>
						</CardFooter>
					</Card>
				</div>

				<div className="lg:col-span-1">
					<Card className="sticky top-6">
						<CardHeader className="px-6 py-4 border-b">
							<CardTitle className="text-lg">Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="py-4 px-6">
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span>${totalPrice.toFixed(2)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Shipping</span>
									<span>Calculated at checkout</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tax</span>
									<span>Calculated at checkout</span>
								</div>
							</div>

							<Separator className="my-4" />

							<div className="flex justify-between font-medium text-lg">
								<span>Total</span>
								<span>${totalPrice.toFixed(2)}</span>
							</div>
						</CardContent>
						<CardFooter className="px-6 pb-6 pt-2">
							<Button
								className="w-full"
								size="lg"
								onClick={() => router.push("/checkout")}
								disabled={!!isProcessing}
							>
								Proceed to Checkout
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
