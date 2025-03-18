"use client";
import { Trash, Upload, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Product } from "@prisma/client";
import { toast } from "sonner";
import { generateSKU } from "@/lib/sku-generator";
import { useDebouncedCallback } from "use-debounce";
import { addProduct } from "./add-product-action";

const formSchema = z.object({
	name: z.string().min(3, "Product name must be at least 3 characters"),
	description: z.string().optional(),
	price: z.coerce
		.number()
		.positive("Price must be a positive number")
		.min(0.01, "Price must be at least 0.01"),
	inventory: z.coerce
		.number()
		.int()
		.nonnegative("Inventory must be 0 or higher"),
	isActive: z.boolean().default(true),
	categoryIds: z.array(z.string()).min(1, "Select at least one category"),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryProps {
	categories: Category[];
}

export function AddProductForm({ categories }: CategoryProps) {
	const [images, setImages] = useState<File[]>([]);
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			price: 0,
			inventory: 0,
			isActive: true,
			categoryIds: [],
		},
	});

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files);

			// Limit to 5 images total
			if (images.length + newFiles.length > 5) {
				toast.error("Too many images", {
					description: "You can upload a maximum of 5 images per product",
				});
				return;
			}

			// Create preview URLs
			const newUrls = newFiles.map((file) => URL.createObjectURL(file));

			setImages((prevImages) => [...prevImages, ...newFiles]);
			setImageUrls((prevUrls) => [...prevUrls, ...newUrls]);
		}
	};

	// Remove an image
	const removeImage = (index: number) => {
		// Revoke the object URL to avoid memory leaks
		URL.revokeObjectURL(imageUrls[index]);

		setImages((prevImages) => prevImages.filter((_, i) => i !== index));
		setImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
	};

	// Form submission
	const onSubmit = async (data: FormValues) => {
		// if (images.length === 0) {
		// 	toast.error("No images selected", {
		// 		description: "Please add at least one product image",
		// 	});
		// 	return;
		// }

		setIsSubmitting(true);

		console.log(form);

		try {
			// In a real application, you would:
			// 1. Upload images to storage and get URLs
			// 2. Send product data to your API

			// const uploadedImageUrls = images.map((_, index) =>
			// 	`/images/products/${data.sku.toLowerCase()}-${index + 1}.jpg`
			//   );

			// Define the expected result type
			interface ProductActionResult {
				success: boolean;
				data?: Product;
				message?: string;
			}

			const result = (await addProduct({
				...data,
				imageUrls,
			})) as ProductActionResult;

			if (result.success) {
				toast.success("Product created", {
					description: `Product ${data.name} has been created successfully`,
				});
				router.push("/dashboard");
			} else {
				toast.error("Error creating product", {
					description: result.message || "An unknown error occurred!",
				});
			}

			// Navigate back to products page
		} catch (error) {
			toast.error("Error", {
				description: "Failed to create product. Please try again.",
			});
			console.error("Error creating product:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{/* Basic Product Information */}
				<div className="space-y-6">
					<h3 className="text-lg font-medium">Product Information</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Product Name*</FormLabel>
									<FormControl>
										<Input placeholder="e.g. Wireless Headphones" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Describe your product..."
										className="min-h-32 resize-y"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Pricing and Inventory */}
				<div className="space-y-6">
					<h3 className="text-lg font-medium">Pricing & Inventory</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price*</FormLabel>
									<FormControl>
										<div className="relative">
											<span className="absolute left-3 top-2.5">$</span>
											<Input
												type="number"
												min="0.01"
												step="0.01"
												className="pl-7"
												placeholder="0.00"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="inventory"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Inventory*</FormLabel>
									<FormControl>
										<Input type="number" min="0" placeholder="0" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="isActive"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Active Product</FormLabel>
									<FormDescription>
										This product will be available for purchase immediately
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>
				</div>

				{/* Categories */}
				<div className="space-y-6">
					<h3 className="text-lg font-medium">Categories</h3>

					<FormField
						control={form.control}
						name="categoryIds"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Select Categories*</FormLabel>
								<FormControl>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
										{categories.map((category) => (
											<div
												key={category.id}
												className="flex items-center space-x-2 bg-muted/50 p-2 rounded-md"
											>
												<Checkbox
													id={category.id}
													checked={field.value?.includes(category.id)}
													onCheckedChange={(checked) => {
														if (checked) {
															field.onChange([...field.value, category.id]);
														} else {
															field.onChange(
																field.value?.filter(
																	(value) => value !== category.id,
																),
															);
														}
													}}
												/>
												<label
													htmlFor={category.id}
													className="text-sm font-medium leading-none cursor-pointer"
												>
													{category.name}
												</label>
											</div>
										))}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Product Images */}
				<div className="space-y-6">
					<h3 className="text-lg font-medium">Product Images</h3>

					<div className="grid grid-cols-1 gap-4">
						{/* Image upload area */}
						<div className="flex flex-col items-center justify-center w-full h-32 bg-muted/50 rounded-md border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:bg-muted/70 transition">
							<label
								htmlFor="image-upload"
								className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
							>
								<Upload className="w-6 h-6 text-muted-foreground" />
								<p className="mt-2 text-sm text-muted-foreground">
									Click to upload images (max 5)
								</p>
							</label>
							<Input
								id="image-upload"
								type="file"
								multiple
								accept="image/*"
								className="hidden"
								onChange={handleImageChange}
							/>
						</div>

						{/* Image preview */}
						{imageUrls.length > 0 && (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
								{imageUrls.map((url, index) => (
									<div key={index} className="relative group">
										<div className="aspect-square rounded-md overflow-hidden">
											<img
												src={url}
												alt={`Product ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</div>
										<button
											type="button"
											onClick={() => removeImage(index)}
											className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
										>
											<Trash className="h-4 w-4 text-white" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Submit button */}
				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="hover:cursor-pointer"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating Product...
							</>
						) : (
							<>
								<Plus className="mr-2 h-4 w-4" />
								Create Product
							</>
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
