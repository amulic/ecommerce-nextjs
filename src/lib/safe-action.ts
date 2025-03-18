import { isAuthenticated } from "./auth";
import { createSafeActionClient } from "next-safe-action";

export const unsafeActionClient = createSafeActionClient();

export const safeActionClient = unsafeActionClient.use(
	async ({ clientInput, next }) => {
		const user = await isAuthenticated();
		if (!user) {
			throw new Error("Session is not valid!");
		}

		// Return the result of next() - this was missing in your code
		return next({ ctx: user });
	},
);
