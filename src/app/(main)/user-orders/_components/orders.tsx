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
import type { Order } from "@polar-sh/sdk/models/components/order.js";
import { format, parseISO } from "date-fns";

export function Orders({ orders }: { orders: Order[] }) {
	const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

	const toggleOrderDetails = (orderId: string) => {
		setExpandedOrder(expandedOrder === orderId ? null : orderId);
	};

	console.log("Orders:", JSON.stringify(orders[0], null, 2));

	// Convert cents to dollars with formatting
	const formatCurrency = (amount: number, currency = "usd") => {
		const numericAmount = amount / 100;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(numericAmount);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "paid":
				return "bg-green-100 text-green-800";
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "refunded":
				return "bg-blue-100 text-blue-800";
			case "cancelled":
			case "canceled":
				return "bg-red-100 text-red-800";
			case "pending":
				return "bg-orange-100 text-orange-800";
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
								<TableHead className="w-[50px]" />
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
											{order.createdAt.toLocaleDateString("en-US", {
												year: "numeric",
												month: "2-digit",
												day: "2-digit",
											})}
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(order.status)}>
												{order.status.charAt(0).toUpperCase() +
													order.status.slice(1)}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											{formatCurrency(order.totalAmount, order.currency)}
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
												<div className="p-4 bg-gray-50 space-y-4">
													{/* Order Items */}
													<div>
														<h4 className="font-medium mb-2">Order Items</h4>
														<Table>
															<TableHeader>
																<TableRow>
																	<TableHead>Product</TableHead>
																	<TableHead>Quantity</TableHead>
																	<TableHead className="text-right">
																		Amount
																	</TableHead>
																</TableRow>
															</TableHeader>
															<TableBody>
																{order.items.map((item) => (
																	<TableRow key={item.id}>
																		<TableCell>
																			<div>
																				<div className="font-medium">
																					{item.label}
																				</div>
																				{item.label && (
																					<div className="text-sm text-gray-500">
																						{item.label}
																					</div>
																				)}
																				{order.items && (
																					<div className="text-sm text-gray-500">
																						Total Amount:{" "}
																						{formatCurrency(
																							item.amount,
																							order.currency,
																						)}
																					</div>
																				)}
																			</div>
																		</TableCell>
																		<TableCell>{order.items.length}</TableCell>
																		<TableCell className="text-right">
																			{formatCurrency(
																				item.amount,
																				order.currency,
																			)}
																		</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</div>

													{/* Price Summary */}
													<div className="pt-2">
														<h4 className="font-medium mb-2">Order Summary</h4>
														<div className="bg-white p-4 rounded border space-y-2">
															<div className="flex justify-between">
																<span className="text-gray-600">Subtotal</span>
																<span>
																	{formatCurrency(
																		order.subtotalAmount,
																		order.currency,
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-gray-600">Tax</span>
																<span>
																	{formatCurrency(
																		order.taxAmount,
																		order.currency,
																	)}
																</span>
															</div>
															<div className="flex justify-between border-t pt-2 font-medium">
																<span>Total</span>
																<span>
																	{formatCurrency(
																		order.totalAmount,
																		order.currency,
																	)}
																</span>
															</div>
															<div className="flex justify-between pt-1">
																<span className="text-gray-600">
																	Payment Status
																</span>
																<Badge
																	variant={order.paid ? "success" : "outline"}
																>
																	{order.paid ? "Paid" : "Unpaid"}
																</Badge>
															</div>
														</div>
													</div>

													{/* Billing Information */}
													{order.billingAddress && (
														<div className="pt-2">
															<h4 className="font-medium mb-2">
																Billing Information
															</h4>
															<div className="bg-white p-4 rounded border">
																<p>{order.billingAddress.name}</p>
																<p>{order.billingAddress.line1}</p>
																{order.billingAddress.line2 && (
																	<p>{order.billingAddress.line2}</p>
																)}
																<p>
																	{order.billingAddress.city},{" "}
																	{order.billingAddress.state}{" "}
																	{order.billingAddress.postalCode}
																</p>
																<p>{order.billingAddress.country}</p>
															</div>
														</div>
													)}
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
