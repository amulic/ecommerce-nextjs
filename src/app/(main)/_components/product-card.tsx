import Image from "next/image";
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
	product: {
		id: string;
		name: string;
		price: number;
		image: string;
		category: string;
	};
}

export default function ProductCard({ product }: ProductCardProps) {
	return (
		<Card className="flex flex-col">
			<CardHeader className="p-0 relative h-48 overflow-hidden">
				<Image
					src={product.image}
					alt={product.name}
					fill
					className="object-cover"
				/>
			</CardHeader>
			<CardContent className="p-4 flex-1 flex flex-col justify-between">
				<div>
					<h3 className="font-semibold text-lg">{product.name}</h3>
					<p className="text-sm text-muted-foreground">{product.category}</p>
				</div>
				<p className="mt-2 text-primary font-bold">${product.price}</p>
			</CardContent>
			<CardFooter className="p-4">
				<Button className="w-full">Add to Cart</Button>
			</CardFooter>
		</Card>
	);
}
