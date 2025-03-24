"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getCartContents } from "../shopping-cart/_actions/cart-actions";

export function CartCount() {
	const [count, setCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const fetchCartCount = async () => {
		try {
			const result = await getCartContents();
			if (result.success) {
				setCount(result.totalItems);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCartCount();

		// Update cart count when cart is updated
		const handleCartUpdate = () => {
			fetchCartCount();
		};

		window.addEventListener("cartUpdated", handleCartUpdate);

		return () => {
			window.removeEventListener("cartUpdated", handleCartUpdate);
		};
	}, []);

	return (
		<Link href="/shopping-cart">
			<Button variant="ghost" size="icon" className="relative">
				<ShoppingCart className="h-5 w-5" />
				{!isLoading && count > 0 && (
					<Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
						{count > 99 ? "99+" : count}
					</Badge>
				)}
			</Button>
		</Link>
	);
}
