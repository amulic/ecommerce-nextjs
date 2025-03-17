// TODO DO THIS RIGHT, SEPERATE THE CLIENTSIDE LOGIC FROM THE SERVERSIDE LOGIC

import { Card, CardContent } from "@/components/ui/card";
import { AddProductForm } from "./_components/add-product-form";
import { prisma } from "@/lib/prisma";
import type { Category } from "@prisma/client";

async function getCategories() {
	const categories = await prisma.category.findMany();
	return categories;
}

export default async function AddProductPage() {
	// Handle image uploads

	const categories = await getCategories();

	return (
		<div className="p-8 space-y-8">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold">Add New Product</h1>
				<p className="text-gray-500">Create a new product for your store</p>
			</div>

			<Card>
				<CardContent className="pt-6">
					<AddProductForm categories={categories} />
				</CardContent>
			</Card>
		</div>
	);
}
