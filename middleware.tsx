import { NextRequest, NextResponse } from "next/server";

// apply authetication by next-auth to entire project.
export { default } from "next-auth/middleware";

// apply next-auth to specific matching route
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// export const config = { matcher: ["/dashboard", "/extra"] };

// to allow cross-origin requests
const allowedOrigins = [
  "https://acme.com",
  "https://my-app.org",
  "http://localhost:3000/*",
  "https://www.wikipedia.org/*",
  "https://www.sciencedirect.com/*",
  "https://serpapi.com/*"
];

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function middleware(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
//   matcher: "/api/:path*",
  matcher: ["/dashboard", "/extra", "/api/:path*"],
};