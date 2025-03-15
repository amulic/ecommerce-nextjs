import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import { cache } from "react";
import { headers } from "next/headers";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
	},
	//plugins: [username()],
});

export const isAuthenticated = cache(async () => {
	return auth.api.getSession({
		headers: await headers(),
	});
});
