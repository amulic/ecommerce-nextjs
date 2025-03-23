"use client";

import Image from "next/image";
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import type { Product } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";
import { AddToCartButton } from "./add-to-cart-button";

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
	return (
		<Card className="flex flex-col">
			<CardHeader className="p-0 relative h-48 overflow-hidden">
				{product.images.length > 0 ? (
					<Image
						src={product.images[0]}
						alt={product.name}
						layout="fill"
						objectFit="cover"
						className="object-cover"
					/>
				) : (
					<div className="h-full w-full bg-gray-200 flex items-center justify-center">
						<span>No Image</span>
					</div>
				)}
			</CardHeader>
			<CardContent className="p-4 flex-1 flex flex-col justify-between">
				<div>
					<h3 className="font-semibold text-lg">{product.name}</h3>
					<p className="text-sm text-muted-foreground">{product.description}</p>
				</div>
				<p className="mt-2 text-primary font-bold">${product.price}</p>
			</CardContent>
			<CardFooter className="p-4">
				<AddToCartButton productId={product.id} inventory={product.inventory} />
			</CardFooter>
		</Card>
	);
}
