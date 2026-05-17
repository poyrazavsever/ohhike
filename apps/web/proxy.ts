import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getClerkMiddlewareKeys } from "./lib/clerk-env";
import { isCoachNetworkEnabled } from "./lib/coach-network";

const isCoachNetworkRoute = createRouteMatcher([
  "/find-coach(.*)",
  "/coach-network(.*)",
  "/account-type(.*)",
  "/athlete(.*)",
  "/login(.*)",
  "/register(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/about(.*)",
  "/features(.*)",
  "/pricing(.*)",
  "/blog(.*)",
  "/community(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/security(.*)",
  "/self-host(.*)",
  "/docs(.*)",
  "/find-coach(.*)",
  "/coach-network/coaches/(.*)",
  "/login(.*)",
  "/register(.*)",
]);

const isCoachNetworkProtectedRoute = createRouteMatcher([
  "/account-type(.*)",
  "/athlete(.*)",
  "/coach-network/apply(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isCoachNetworkRoute(req) && !isCoachNetworkEnabled()) {
      return new NextResponse(null, { status: 404 });
    }

    if (!isCoachNetworkEnabled()) {
      return NextResponse.next();
    }

    const { isAuthenticated } = await auth();

    if (isCoachNetworkProtectedRoute(req) && !isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (!isPublicRoute(req) && !isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  () => getClerkMiddlewareKeys(),
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
