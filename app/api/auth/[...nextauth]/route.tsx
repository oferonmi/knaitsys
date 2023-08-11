import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import Auth0Provider from "next-auth/providers/auth0"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { NextApiRequest, NextApiResponse } from "next"

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }),

        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string
        }),

        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),

        // Auth0Provider({
        //     clientId: process.env.AUTH0_CLIENT_ID as string,
        //     clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
        //     issuer: process.env.AUTH0_ISSUER
        // })
    ],

    secret: process.env.NEXTAUTH_SECRET,
    // pages: {
    //     signIn: "/api/auth/signin",
    // },

    signInMethod: "email",
}

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };