import {ProductCard} from "@/app/(main)/_components/product-card";
import { Search } from "../_components/search";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage(props: {
	searchParams: Promise<{
		search?: string;
		category?: string;
	}>
}) {
	const { search, category } = await props.searchParams;

	const categories = await prisma.category.findMany(	);
	

	const products = await prisma.product.findMany({
		where: {
			name: {
				contains: search,
			},
			categories: {
				some: {
					slug: category,
				},
			},
		}
	});

	return (
		<div className="p-8 space-y-8">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-gray-500">
					Manage products, view analytics, and more
				</p>
			</div>

			<Search categories={categories} />

			{/* Products Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-8">
       
        
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
			
		</div>
	);
}
