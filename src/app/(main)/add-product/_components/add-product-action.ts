"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeActionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { generateSKU } from "@/lib/sku-generator";

const productSchema = z.object({
	name: z.string().min(3, "Product name must be at least 3 characters long"),
	description: z.string().optional(),
	price: z.coerce.number().positive("Price must be a positive number"),
	//sku: z.string().min(3, "SKU must be at least 3 characters long"),
	inventory: z.coerce.number().nonnegative(),
	isActive: z.boolean().default(true),
	categoryIds: z.array(z.string()).min(1, "Select at least one category"),
	imageUrls: z.array(z.string()).optional(),
});

export const addProduct = safeActionClient
	.schema(productSchema)
	.action(async (args) => {
		const {
			name,
			description,
			price,
			inventory,
			isActive,
			categoryIds,
			imageUrls,
		} = args.parsedInput;
		try {
			const newSku = generateSKU(name);
			// creating a product
			const product = await prisma.product.create({
				data: {
					name,
					description: description || null,
					price,
					sku: newSku,
					inventory,
					isActive,
					categories: {
						connect: categoryIds.map((id: string) => ({ id })),
					},
					images: imageUrls || [], // Store image URLs directly in the images array field
				},
			});

			revalidatePath("/dashboard");

			return {
				success: true,
				data: product,
				message: `Product ${name} created successfully`,
			};
		} catch (error) {
			console.error("Error creating product", error);

			if (error instanceof Error) {
				if (
					error.message.includes(
						"Unique constraint failed on the fields: (`sku`)",
					)
				) {
					return {
						success: false,
						message: "A product with this SKU already exists.",
					};
				}
			}

			return {
				success: false,
				message:
					error instanceof Error ? error.message : "Failed to create product.",
			};
		}
	});
