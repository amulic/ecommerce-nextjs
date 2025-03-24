"use server";

import { prisma } from "@/lib/prisma";
import { polar } from "@/lib/polar";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";

/**
 * Creates a checkout session with Polar
 */
export async function createCheckoutSession() {
	try {
		// Get the user session
		const session = await isAuthenticated();

		// Determine the user identifier (either logged in user or cart ID from cookie)
		const userId = session?.user?.id;
		//const cartId = cookies().get("cartId")?.value;

		if (!userId && !cartId) {
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

		// Create line items for Polar checkout
		const lineItems = cart.items.map((item) => ({
			productId: item.product.polarId, // Use the Polar product ID
			quantity: item.quantity,
		}));

		// Create checkout session with Polar
		const checkoutSession = await polar.checkouts.createSession({
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?sessionId={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/canceled`,
			line_items: lineItems,
			// Include customer data if available
			...(session?.user
				? {
						customer_email: session.user.email,
						customer_name: session.user.name || undefined,
					}
				: {}),
		});

		// Store the checkout session ID with the cart for future reference
		await prisma.cart.update({
			where: { id: cart.id },
			data: {
				checkoutSessionId: checkoutSession.id,
			},
		});

		revalidatePath("/checkout");

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
