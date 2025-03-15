"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import ProductCard from "@/app/(main)/_components/product-card";

// Mock product generator
const generateMockProducts = (count = 10, offset = 0) => {
	return Array.from({ length: count }).map((_, i) => ({
		id: `product-${offset + i}`,
		name: `Product ${offset + i + 1}`,
		price: Math.floor(Math.random() * 100) + 10,
		category: ["Clothing", "Electronics", "Accessories"][
			Math.floor(Math.random() * 3)
		],
		image: "",
	}));
};

export default function DashboardPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [category, setCategory] = useState("");
	const [products, setProducts] = useState(() => generateMockProducts(12));
	const [isLoading, setIsLoading] = useState(false);
	const observerRef = useRef<HTMLDivElement | null>(null);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleCategoryChange = (value: string) => {
		setCategory(value);
	};

	const handleFilter = () => {
		console.log("Searching for:", searchQuery);
		console.log("Category:", category);
		// Optionally reset products here
	};

	// Infinite scroll loading function
	const loadMoreProducts = useCallback(() => {
		if (isLoading) return;

		setIsLoading(true);
		setTimeout(() => {
			setProducts((prev) => [...prev, ...generateMockProducts(8, prev.length)]);
			setIsLoading(false);
		}, 1000);
	}, [isLoading]);

	// IntersectionObserver to trigger loadMoreProducts
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMoreProducts();
				}
			},
			{ threshold: 1 },
		);

		if (observerRef.current) observer.observe(observerRef.current);

		return () => {
			if (observerRef.current) observer.unobserve(observerRef.current);
		};
	}, [loadMoreProducts]);

	return (
		<div className="p-8 space-y-8">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-gray-500">
					Manage products, view analytics, and more
				</p>
			</div>

			{/* Filters Section */}
			<div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
				<div className="flex flex-col space-y-2 w-full md:w-1/3">
					<Label htmlFor="search">Search Products</Label>
					<Input
						id="search"
						placeholder="Search by product name..."
						value={searchQuery}
						onChange={handleSearchChange}
					/>
				</div>

				<div className="flex flex-col space-y-2 w-full md:w-1/4">
					<Label htmlFor="category">Category</Label>
					<Select onValueChange={handleCategoryChange}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="clothing">Clothing</SelectItem>
							<SelectItem value="electronics">Electronics</SelectItem>
							<SelectItem value="accessories">Accessories</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="w-full md:w-auto">
					<Button className="w-full" onClick={handleFilter}>
						Filter
					</Button>
				</div>
			</div>

			{/* Products Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-8">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>

			{/* Loader + Observer */}
			<div ref={observerRef} className="flex justify-center items-center py-8">
				{isLoading && (
					<p className="text-sm text-muted-foreground">
						Loading more products...
					</p>
				)}
			</div>
		</div>
	);
}
