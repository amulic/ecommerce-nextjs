"use server";

import { isAuthenticated } from "@/lib/auth";
import { polar } from "@/lib/polar";

export async function getOrdersByCustomer() {
	const session = await isAuthenticated();

	const userId = session?.user.id || null;
	console.log("User ID:", userId);

	if (!userId) {
		return { success: false, message: "No user found" };
	}
	if (!session) {
		return { success: false, message: "No session found" };
	}

	const customer = await polar.customers.getExternal({
		externalId: userId,
	});

	const orders = await polar.orders.list({
		customerId: customer.id,
	});

	console.log("Orders:", orders.result.items);

	return { success: true, orders: orders.result.items };
}
