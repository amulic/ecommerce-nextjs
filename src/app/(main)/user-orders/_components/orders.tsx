"use client";

import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import React from "react";

export type OrderItem = {
	id: string;
	name: string;
	price: number;
	quantity: number;
};

export type Order = {
	id: string;
	date: string;
	total: number;
	status: "processing" | "shipped" | "delivered" | "cancelled";
	items: OrderItem[];
};

type OrdersProps = {
	orders: Order[];
};

export function Orders({ orders }: OrdersProps) {
	const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

	const toggleOrderDetails = (orderId: string) => {
		setExpandedOrder(expandedOrder === orderId ? null : orderId);
	};

	const getStatusColor = (status: Order["status"]) => {
		switch (status) {
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "shipped":
				return "bg-blue-100 text-blue-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (!orders || orders.length === 0) {
		return (
			<Card className="w-full">
				<CardContent className="flex flex-col items-center justify-center p-10">
					<Package size={48} className="text-gray-400 mb-4" />
					<p className="text-lg font-medium text-gray-500">No orders found</p>
					<p className="text-sm text-gray-400 mt-1">
						When you place orders, they will appear here
					</p>
					<Button className="mt-6">Start Shopping</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Your Orders</CardTitle>
					<CardDescription>View and manage your order history</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order ID</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Total</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => (
								<React.Fragment key={order.id}>
									<TableRow>
										<TableCell className="font-medium">
											{order.id.substring(0, 8)}...
										</TableCell>
										<TableCell>
											{new Date(order.date).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(order.status)}>
												{order.status.charAt(0).toUpperCase() +
													order.status.slice(1)}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											${order.total.toFixed(2)}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => toggleOrderDetails(order.id)}
												className="p-0 h-8 w-8"
											>
												{expandedOrder === order.id ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												)}
											</Button>
										</TableCell>
									</TableRow>
									{expandedOrder === order.id && (
										<TableRow>
											<TableCell colSpan={5} className="p-0">
												<div className="p-4 bg-gray-50">
													<h4 className="font-medium mb-2">Order Items</h4>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Product</TableHead>
																<TableHead>Price</TableHead>
																<TableHead>Quantity</TableHead>
																<TableHead className="text-right">
																	Subtotal
																</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{order.items.map((item) => (
																<TableRow key={item.id}>
																	<TableCell>{item.name}</TableCell>
																	<TableCell>
																		${item.price.toFixed(2)}
																	</TableCell>
																	<TableCell>{item.quantity}</TableCell>
																	<TableCell className="text-right">
																		${(item.price * item.quantity).toFixed(2)}
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
											</TableCell>
										</TableRow>
									)}
								</React.Fragment>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
