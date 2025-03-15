// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	console.log("Seeding database...");

	// Clear existing data
	await prisma.$transaction([
		prisma.orderItem.deleteMany(),
		prisma.order.deleteMany(),
		prisma.review.deleteMany(),
		prisma.product.deleteMany(),
		prisma.category.deleteMany(),
		prisma.userRole.deleteMany(),
		prisma.permission.deleteMany(),
		prisma.role.deleteMany(),
		prisma.session.deleteMany(),
		prisma.account.deleteMany(),
		prisma.user.deleteMany(),
	]);

	// Create roles and permissions
	const adminRole = await prisma.role.create({
		data: {
			id: "role_admin",
			name: "admin",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});

	const managerRole = await prisma.role.create({
		data: {
			id: "role_manager",
			name: "manager",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});

	const userRole = await prisma.role.create({
		data: {
			id: "role_user",
			name: "user",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});

	// Create permissions
	const permissions = await Promise.all([
		prisma.permission.create({
			data: {
				name: "manage_users",
				description: "Can manage all users",
				roles: {
					connect: { id: adminRole.id },
				},
			},
		}),
		prisma.permission.create({
			data: {
				name: "manage_products",
				description: "Can manage all products",
				roles: {
					connect: [{ id: adminRole.id }, { id: managerRole.id }],
				},
			},
		}),
		prisma.permission.create({
			data: {
				name: "view_orders",
				description: "Can view all orders",
				roles: {
					connect: [{ id: adminRole.id }, { id: managerRole.id }],
				},
			},
		}),
	]);

	// Create admin user
	const adminUser = await prisma.user.create({
		data: {
			name: "Admin User",
			email: "admin@example.com",
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			accounts: {
				create: {
					id: "account_admin",
					providerId: "credentials",
					accountId: "admin",
					password: await hash("password123", 10),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			},
			userRoles: {
				create: {
					roleId: adminRole.id,
				},
			},
		},
	});

	// Create regular user
	const regularUser = await prisma.user.create({
		data: {
			name: "Regular User",
			email: "user@example.com",
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			accounts: {
				create: {
					id: "account_user",
					providerId: "credentials",
					accountId: "user",
					password: await hash("password123", 10),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			},
			userRoles: {
				create: {
					roleId: userRole.id,
				},
			},
		},
	});

	// Create categories
	const electronicsCategory = await prisma.category.create({
		data: {
			name: "Electronics",
			slug: "electronics",
			description: "Electronic devices and gadgets",
		},
	});

	const clothingCategory = await prisma.category.create({
		data: {
			name: "Clothing",
			slug: "clothing",
			description: "Apparel and fashion items",
		},
	});

	// Create subcategories
	const smartphonesCategory = await prisma.category.create({
		data: {
			name: "Smartphones",
			slug: "smartphones",
			description: "Mobile phones and accessories",
			parentId: electronicsCategory.id,
		},
	});

	const laptopsCategory = await prisma.category.create({
		data: {
			name: "Laptops",
			slug: "laptops",
			description: "Portable computers",
			parentId: electronicsCategory.id,
		},
	});

	// Create products
	const products = await Promise.all([
		prisma.product.create({
			data: {
				name: "iPhone 14 Pro",
				description: "Latest Apple smartphone with advanced features",
				price: 999.99,
				sku: "IPHONE14PRO",
				inventory: 50,
				images: ["iphone14pro_1.jpg", "iphone14pro_2.jpg"],
				categories: {
					connect: [
						{ id: electronicsCategory.id },
						{ id: smartphonesCategory.id },
					],
				},
			},
		}),
		prisma.product.create({
			data: {
				name: "MacBook Pro M2",
				description: "Powerful laptop with Apple M2 chip",
				price: 1499.99,
				sku: "MACBOOKM2",
				inventory: 30,
				images: ["macbookm2_1.jpg", "macbookm2_2.jpg"],
				categories: {
					connect: [{ id: electronicsCategory.id }, { id: laptopsCategory.id }],
				},
			},
		}),
		prisma.product.create({
			data: {
				name: "Cotton T-Shirt",
				description: "Comfortable cotton t-shirt in various colors",
				price: 19.99,
				sku: "COTTONTSHIRT",
				inventory: 100,
				images: ["tshirt_1.jpg", "tshirt_2.jpg"],
				categories: {
					connect: { id: clothingCategory.id },
				},
			},
		}),
	]);

	// Create reviews
	await prisma.review.create({
		data: {
			rating: 5,
			comment: "Great product, very satisfied!",
			userId: regularUser.id,
			productId: products[0].id,
		},
	});

	await prisma.review.create({
		data: {
			rating: 4,
			comment: "Good laptop, but battery could be better",
			userId: regularUser.id,
			productId: products[1].id,
		},
	});

	// Create an order
	const order = await prisma.order.create({
		data: {
			userId: regularUser.id,
			status: "DELIVERED",
			totalAmount: 1019.98,
			shippingAddress: "123 Main St, Anytown, USA",
			billingAddress: "123 Main St, Anytown, USA",
			paymentMethod: "CREDIT_CARD",
			paymentStatus: "PAID",
		},
	});

	// Create order items
	await Promise.all([
		prisma.orderItem.create({
			data: {
				orderId: order.id,
				productId: products[0].id,
				quantity: 1,
				price: 999.99,
			},
		}),
		prisma.orderItem.create({
			data: {
				orderId: order.id,
				productId: products[2].id,
				quantity: 1,
				price: 19.99,
			},
		}),
	]);

	console.log("Database seeding completed!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
