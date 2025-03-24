"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "../shopping-cart/_actions/cart-actions";
import { toast } from "sonner";
import { Loader2, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
	productId: string;
	inventory: number;
}

export function AddToCartButton({
	productId,
	inventory,
}: AddToCartButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleAddToCart = async () => {
		setIsLoading(true);

		try {
			const result = await addToCart(productId, 1);

			if (result.success) {
				toast.success("Added to cart");
				window.dispatchEvent(new Event("cartUpdated"));
			} else {
				toast.error(result.message || "Failed to add to cart");
			}
		} catch (error) {
			toast.error("An error occurred");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			className="w-full cursor-pointer"
			onClick={handleAddToCart}
			disabled={isLoading || inventory <= 0}
		>
			{isLoading ? (
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			) : (
				<ShoppingCart className="mr-2 h-4 w-4" />
			)}
			{inventory <= 0 ? "Out of Stock" : "Add to Cart"}
		</Button>
	);
}
