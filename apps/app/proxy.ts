import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getClerkMiddlewareKeys } from "./lib/clerk-env";
import { isCoachNetworkEnabled } from "./lib/coach-network";
import { getRequestPublicOrigin, getRequestPublicUrl } from "./lib/request-origin";

const isCoachNetworkRoute = createRouteMatcher(["/coach-network(.*)"]);

const isPublicRoute = createRouteMatcher([
  "/api/health",
  "/api/webhooks/clerk(.*)",
  "/login(.*)",
  "/register(.*)",
  "/invite(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isCoachNetworkRoute(req) && !isCoachNetworkEnabled()) {
      return new NextResponse(null, { status: 404 });
    }

    const { isAuthenticated } = await auth();

    if (!isAuthenticated && !isPublicRoute(req)) {
      const loginUrl = new URL("/login", getRequestPublicOrigin(req));
      loginUrl.searchParams.set("redirect_url", getRequestPublicUrl(req));

      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-pathname", req.nextUrl.pathname);
    return response;
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
