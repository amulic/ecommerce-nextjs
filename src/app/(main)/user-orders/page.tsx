import { Orders, type Order, OrderItem } from "./_components/orders";
import { getOrdersByCustomer } from "./_actions/order-actions";

// Mock function to simulate fetching orders from a database
async function getOrders(): Promise<Order[]> {
	// In a real app, this would fetch from an API or database
	return [
		{
			id: "ord_12345678",
			date: "2023-07-15T10:30:00Z",
			total: 125.99,
			status: "delivered",
			items: [
				{
					id: "item_1",
					name: "Wireless Headphones",
					price: 79.99,
					quantity: 1,
				},
				{
					id: "item_2",
					name: "Phone Case",
					price: 23.0,
					quantity: 2,
				},
			],
		},
		{
			id: "ord_87654321",
			date: "2023-08-02T14:45:00Z",
			total: 349.95,
			status: "shipped",
			items: [
				{
					id: "item_3",
					name: "Smart Watch",
					price: 249.95,
					quantity: 1,
				},
				{
					id: "item_4",
					name: "Charging Cable",
					price: 25.0,
					quantity: 4,
				},
			],
		},
		{
			id: "ord_56781234",
			date: "2023-08-10T09:15:00Z",
			total: 1299.0,
			status: "processing",
			items: [
				{
					id: "item_5",
					name: "Laptop",
					price: 1299.0,
					quantity: 1,
				},
			],
		},
	];
}

export default async function Page() {
	// Server-side data fetching
	const orders = await getOrders();
	const ordersReal = await getOrdersByCustomer();
	console.log("Orders real", ordersReal);

	return (
		<div className="container max-w-4xl mx-auto py-8">
			<Orders orders={orders} />
		</div>
	);
}
