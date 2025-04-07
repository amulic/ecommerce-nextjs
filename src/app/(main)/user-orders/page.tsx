import { getOrdersByCustomer } from "./_actions/order-actions";
import { Orders } from "./_components/orders";

export default async function Page() {
	// Server-side data fetching

	const orders = await getOrdersByCustomer();

	return (
		<div className="container max-w-4xl mx-auto py-8">
			<Orders orders={orders?.orders ?? []} />
		</div>
	);
}
