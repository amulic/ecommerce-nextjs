import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { redirect } from "next/navigation";

// Dummy product data
const products = [
	{
		id: 1,
		name: "Stylish Sneakers",
		price: "$89.99",
		image: "",
	},
	{
		id: 2,
		name: "Leather Handbag",
		price: "$129.99",
		image: "",
	},
	{
		id: 3,
		name: "Classic Watch",
		price: "$249.99",
		image: "",
	},
];

export default function Page() {
	return (
		<div className="flex flex-col h-full w-full">
			{/* Hero Section */}
			<section className="bg-gray-100 py-20 px-4 text-center">
				<h1 className="text-4xl md:text-6xl font-bold mb-4">
					Welcome to MyShop
				</h1>
				<p className="text-gray-600 text-lg mb-6">
					Your one-stop shop for amazing products
				</p>
				<Button size="lg" className="text-lg">
					Shop Now
				</Button>
			</section>

			{/* Featured Products */}
			<section className="flex-1 container mx-auto py-16 px-4">
				<h2 className="text-3xl font-semibold text-center mb-12">
					Featured Products
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{products.map((product) => (
						<Card key={product.id} className="hover:shadow-lg transition">
							<CardHeader>
								<CardTitle className="text-lg">{product.name}</CardTitle>
							</CardHeader>
							<CardContent className="flex justify-center">
								<Image
									src={product.image || ""}
									alt={product.name}
									width={300}
									height={300}
									className="rounded-md object-cover"
								/>
							</CardContent>
							<CardFooter className="flex justify-between items-center">
								<span className="text-xl font-bold">{product.price}</span>
								<Button>Add to Cart</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white text-center p-4">
				&copy; {new Date().getFullYear()} MyShop. All rights reserved.
			</footer>
		</div>
	);
}
