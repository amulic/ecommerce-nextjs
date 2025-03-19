import Image from "next/image";
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@prisma/client";

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
	const addToCart = (productId: string) => {
		console.log("Add to cart:", product.name);
		// Implementation needed
	};

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
				<Button className="w-full hover:cursor-pointer">Add to Cart</Button>
			</CardFooter>
		</Card>
	);
}
