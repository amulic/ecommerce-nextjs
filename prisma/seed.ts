// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
//import { hash } from "better-auth";

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
		prisma.verification.deleteMany(),
		prisma.session.deleteMany(),
		prisma.account.deleteMany(),
		prisma.user.deleteMany(),
	]);

	// Create admin user
	const adminUser = await prisma.user.create({
		data: {
			name: "Admin User",
			email: "admin@example.com",
			emailVerified: true,
			role: Role.ADMIN,
			createdAt: new Date(),
			updatedAt: new Date(),
			accounts: {
				create: {
					providerId: "credentials", // Changed from email-password to credentials
					accountId: "admin@example.com",
					password: "Abcd1234/", // Use a simple password for testing
					createdAt: new Date(),
					updatedAt: new Date(),
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
			role: Role.USER,
			createdAt: new Date(),
			updatedAt: new Date(),
			accounts: {
				create: {
					providerId: "credentials", // Changed from email-password to credentials
					accountId: "user@example.com",
					password:
						"5df454627b1c1778ef4bb37e82b7a5fb:55c0515cddb84387a58a29d4924a9749cf51313d3db68ddc6b59082fad8e88a7634e28827a52fbef959a217b4e169e00eb2500b09b67ed3518ed51657ca334eb", // Use a simple password for testing
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			},
		},
	});

	// Create employee user
	const employeeUser = await prisma.user.create({
		data: {
			name: "Employee User",
			email: "employee@example.com",
			emailVerified: true,
			role: Role.EMPLOYEE,
			createdAt: new Date(),
			updatedAt: new Date(),
			accounts: {
				create: {
					providerId: "credentials",
					accountId: "employee@example.com",
					password:
						"5df454627b1c1778ef4bb37e82b7a5fb:55c0515cddb84387a58a29d4924a9749cf51313d3db68ddc6b59082fad8e88a7634e28827a52fbef959a217b4e169e00eb2500b09b67ed3518ed51657ca334eb",
					createdAt: new Date(),
					updatedAt: new Date(),
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
		},
	});

	const laptopsCategory = await prisma.category.create({
		data: {
			name: "Laptops",
			slug: "laptops",
			description: "Portable computers",
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
