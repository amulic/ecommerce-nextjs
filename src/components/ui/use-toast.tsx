"use client";

import type * as React from "react";
import { createContext, useContext } from "react";

interface ToastProps {
	title?: string;
	description?: string;
	duration?: number;
}

interface ToastContextType {
	toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const toast = (props: ToastProps) => {
		// Simple implementation - in a real app, you'd use a more robust toast library
		alert(`${props.title}\n${props.description}`);
	};

	return (
		<ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>
	);
}

export function toast(props: ToastProps) {
	const context = useContext(ToastContext);
	if (context) {
		context.toast(props);
	} else {
		console.error("Toast must be used within a ToastProvider");
		// Fallback alert if not in context
		alert(`${props.title}\n${props.description}`);
	}
}
