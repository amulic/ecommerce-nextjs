"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { authClient } from "@/lib/auth-client";

async function getOrCreateCart() {
	const session = await authClient.getSession();
	const userId = session?.data?.user.id || null;

	if (userId) {
		let cart = await prisma.cart.findFirst({
			where: { userId },
			include: { items: { include: { product: true } } },
		});

		if (!cart) {
			cart = await prisma.cart.create({
				data: { userId },
				include: { items: { include: { product: true } } },
			});
		}

		return cart;
	}

	// // if user is not logged in, create a cart in cookies
	// const cookieStore = cookies();
	// let guestCartId = (await cookieStore).get("guestCartId")?.value;

	// if (!guestCartId) {
	// 	guestCartId = uuidv4();
	// 	(await cookieStore).set("guestCartId", guestCartId, {
	// 		maxAge: 60 * 60 * 24 * 30,
	// 		path: "/",
	// 	});
	// }

	// let cart = await prisma.cart.findFirst({
	// 	where: { guestId: guestCartId }, //no guests
	// 	include: { items: { include: { product: true } } },
	// });

	// if (!cart) {
	// 	cart = await prisma.cart.create({
	// 		data: { guestId: guestCartId },
	// 		include: { items: { include: { product: true } } },
	// 	});
	// }

	// return cart;
}

export async function addToCart(productId: string, quantity = 1) {
	try {
		const cart = await getOrCreateCart();

		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product) {
			return { success: false, message: "Product not found." };
		}

		if (product.inventory < quantity) {
			return {
				success: false,
				message: "Not enough inventory available.",
			};
		}

		const existingItem = await prisma.cartItem.findFirst({
			where: {
				cartId: cart?.id,
				productId: product.id,
			},
		});

		if (existingItem) {
			await prisma.cartItem.update({
				where: { id: existingItem.id, cartId: cart?.id },
				data: { quantity: existingItem.quantity + quantity },
			});
		} else {
			await prisma.cartItem.create({
				data: {
					cartId: cart?.id as string,
					productId: product.id,
					quantity,
				},
			});
		}

		return { success: true };
	} catch (error) {
		console.error("Error adding to cart:", error);
		return { success: false, message: "Failed to add to cart." };
	}
}

export async function removeFromCart(productId: string) {
	try {
		const cart = await getOrCreateCart();

		await prisma.cartItem.delete({
			where: {
				cartId_productId: {
					cartId: cart?.id as string,
					productId: productId,
				},
			},
		});

		revalidatePath("/cart");

		return { success: true };
	} catch (error) {
		console.error("Error removing from cart:", error);
		return { success: false, message: "Failed to remove from cart." };
	}
}

export async function updateCartItemQuantity(
	productId: string,
	quantity: number,
) {
	try {
		if (quantity <= 0) {
			return removeFromCart(productId);
		}

		const cart = await getOrCreateCart();

		// Check inventory
		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product) {
			return { success: false, message: "Product not found" };
		}

		if (product.inventory < quantity) {
			return {
				success: false,
				message: `Only ${product.inventory} items available`,
			};
		}

		await prisma.cartItem.update({
			where: {
				cartId_productId: {
					cartId: cart?.id as string,
					productId: productId,
				},
			},
			data: { quantity },
		});

		//revalidatePath("/cart");

		return { success: true };
	} catch (error) {
		console.error("Error updating cart:", error);
		return { success: false, message: "Failed to update cart" };
	}
}

export async function clearCart() {
	try {
		const cart = await getOrCreateCart();

		await prisma.cartItem.deleteMany({
			where: { cartId: cart?.id },
		});

		//revalidatePath("/cart");

		return { success: true };
	} catch (error) {
		console.error("Error clearing cart:", error);
		return { success: false, message: "Failed to clear cart" };
	}
}

export async function getCartContents() {
	try {
		const cart = await getOrCreateCart();

		const cartWithItems = await prisma.cart.findUnique({
			where: { id: cart?.id },
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		});

		return {
			success: true,
			cart: cartWithItems,
			totalItems:
				cartWithItems?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
			totalPrice:
				cartWithItems?.items.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0,
				) || 0,
		};
	} catch (error) {
		console.error("Error getting cart:", error);
		return {
			success: false,
			message: "Failed to get cart",
			cart: null,
			totalItems: 0,
			totalPrice: 0,
		};
	}
}
