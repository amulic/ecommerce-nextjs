"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { polar } from "@/lib/polar";

/**
 * Creates a checkout session with Polar
 */
export async function createCheckoutSession() {
	try {
		// Get the user session
		const session = await isAuthenticated();

		// Determine the user identifier (either logged in user or cart ID from cookie)
		const userId = session?.user.id || null;

		const cartId = session?.user.Cart[0].id || null;
		//const cartId = cookies().get("cartId")?.value;

		if (!userId || !cartId) {
			return {
				success: false,
				message: "No cart found",
			};
		}

		// Get cart with items and product details
		const cart = await prisma.cart.findFirst({
			where: {
				...(userId ? { userId } : { id: cartId }),
			},
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		});

		if (!cart || cart.items.length === 0) {
			return {
				success: false,
				message: "Your cart is empty",
			};
		}

		// Create line items for Polar checkout - extract just the product IDs
		const lineItems = cart.items
			.map((item) => item.product.polarId)
			.filter((item) => item !== null);
		console.log("Line items:", lineItems);

		// Create checkout session with Polar
		const checkoutSession = await polar.checkouts.create({
			successUrl: "http://localhost:3000/checkout/success",
			products: lineItems,
			// Include customer data if available

			customerEmail: session?.user.email,
			customerName: session?.user.name || undefined,
		});

		// Store the checkout session ID with the cart for future reference
		await prisma.cart.update({
			where: { id: cart.id },
			data: {
				checkoutSessionId: checkoutSession.id,
			},
		});

		console.log(checkoutSession);

		revalidatePath(checkoutSession.url);

		return {
			success: true,
			checkoutUrl: checkoutSession.url,
			sessionId: checkoutSession.id,
		};
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return {
			success: false,
			message: "Failed to create checkout session",
		};
	}
}
