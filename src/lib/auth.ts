import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import { cache } from "react";
import { headers } from "next/headers";
import { polar } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const client = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN,
	server: "sandbox",
});

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
	},
	plugins: [
		polar({
			client,
			createCustomerOnSignUp: true,
			enableCustomerPortal: true,
			checkout: {
				enabled: true,
				successUrl: "/checkout/success",
				products: [],
			},
		}),
	],
	//plugins: [username()],
});

export const isAuthenticated = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) return null;

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: { Cart: true },
	});

	if (!user) return null;

	return { session: session.session, user };
});
