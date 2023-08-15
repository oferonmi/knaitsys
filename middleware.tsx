// apply authetication by next-auth to entire project.
export { default } from "next-auth/middleware";

// apply next-auth to specific matching route
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = { matcher: ["/dashboard", "/extra"] }