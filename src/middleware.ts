//middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	//Get the path the user is trying to access
	const path = request.nextUrl.pathname;

	//Define public paths that don't require authentication
	const isPublicPath =
		path === "/login" || path === "/register" || path === "/forgot-password";

	//Get authentication status from cookies
	const isAuthenticated = request.cookies.has("better-auth.session_token"); // Or whatever cookie name you use

	//Redirect to login if trying to access a protected route while not authenticated
	if (!isAuthenticated && !isPublicPath) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	//If authenticated and trying to access login page, redirect to dashboard
	if (isAuthenticated && isPublicPath) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	return NextResponse.next();
}

//Configure which paths the middleware runs on
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - api routes
		 */
		"/((?!_next/static|_next/image|favicon.ico|public|api).*)",
	],
};
