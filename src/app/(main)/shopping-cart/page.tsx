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
	};

	// Handle item removal
	const handleRemoveItem = async (productId: string) => {
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

		if (!result.success) {
			// Revert on failure
			setCart(oldCart);
			toast.error("Failed to remove item");
			fetchCart(); // Refresh with server data
		}
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
		return <div>Loading cart...</div>;
	}

	if (!cart || cart.items.length === 0) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
				<p className="mb-8">Add some products to your cart to see them here.</p>
				<Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
			</div>
		);
	}

	return (
		<div className="container max-w-4xl mx-auto py-8">
			<h1 className="text-3xl font-bold mb-8">Your Cart</h1>

			<div className="space-y-6">
				{cart.items.map((item) => (
					<div
						key={item.id}
						className="flex items-center justify-between border-b pb-4"
					>
						<div className="flex items-center">
							{item.product.images?.[0] && (
								<div className="w-16 h-16 rounded overflow-hidden mr-4">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={item.product.images[0]}
										alt={item.product.name}
										className="w-full h-full object-cover"
									/>
								</div>
							)}
							<div>
								<h3 className="font-medium">{item.product.name}</h3>
								<p className="text-sm text-gray-500">
									${item.product.price.toFixed(2)} each
								</p>
							</div>
						</div>

						<div className="flex items-center">
							<div className="flex items-center mr-6">
								<Button
									variant="outline"
									size="icon"
									className="h-8 w-8 rounded-full"
									onClick={() =>
										handleUpdateQuantity(item.product.id, item.quantity - 1)
									}
								>
									-
								</Button>
								<span className="w-10 text-center">{item.quantity}</span>
								<Button
									variant="outline"
									size="icon"
									className="h-8 w-8 rounded-full"
									onClick={() =>
										handleUpdateQuantity(item.product.id, item.quantity + 1)
									}
								>
									+
								</Button>
							</div>

							<div className="text-right min-w-[80px]">
								<div className="font-medium">
									${(item.product.price * item.quantity).toFixed(2)}
								</div>
								<button
									className="text-sm text-red-500"
									onClick={() => handleRemoveItem(item.product.id)}
								>
									Remove
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 border-t pt-6">
				<div className="flex justify-between mb-2">
					<span>Subtotal ({totalItems} items)</span>
					<span>${totalPrice.toFixed(2)}</span>
				</div>

				<div className="flex justify-between font-bold text-lg mb-6">
					<span>Total</span>
					<span>${totalPrice.toFixed(2)}</span>
				</div>

				<div className="flex justify-between">
					<Button variant="outline" onClick={handleClearCart}>
						Clear Cart
					</Button>

					<Button onClick={() => router.push("/checkout")}>
						Proceed to Checkout
					</Button>
				</div>
			</div>
		</div>
	);
}
