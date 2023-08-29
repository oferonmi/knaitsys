import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import { GithubProfile } from "next-auth/providers/github";
import { GoogleProfile } from "next-auth/providers/google";
import { FacebookProfile } from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: "Credentials",

            type: "credentials",

            credentials: {
                username: { label: "Username", type: "text", placeholder: "jdoe" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials, req) {
                // retreive user data for credential verification
                // const authResponse = await fetch("/auth/login", {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify(credentials),
                // })

                // if (!authResponse.ok) {
                //     return null;
                // }

                // const user = await authResponse.json()

                // return user

                const user = { id: "0", name: "admin", password: "root", role: "admin" };

                if (credentials?.username === user.name && credentials?.password === user.password) {
                    return user
                } else {
                    return null
                }
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            profile(profile : GoogleProfile) {
                console.log(profile);
                return {
                    ...profile,
                    role: profile.role ?? "user",
                    id: profile.sub.toString(),
                    image: profile.picture,
                }
            },
            authorization: {
                params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
                }
            }
        }),

        // AppleProvider({
        //     clientId: process.env.APPLE_ID as string,
        //     clientSecret: process.env.APPLE_SECRET as string,
        // }),

        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
            profile(profile : FacebookProfile) {
                console.log(profile);
                return {
                    ...profile,
                    role: profile.role ?? "user",
                    id: profile.id.toString(),
                    image: profile.picture.data.url,
                }
            },
        }),

        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
            profile(profile : GithubProfile) {
                console.log(profile);
                return {
                    ...profile,
                    role: profile.role ?? "user",
                    id: profile.id.toString(),
                    image: profile.avatar_url,
                }
            },
        }),
    ],

    callbacks: {
        // Ref: https://authjs.dev/guides/basics/role-based-access-control#persisting-the-role
        async jwt({ token, user }) {
            if (user) token.role = user.role
            return token
        },
        // to use the role in client components
        async session({ session, token }) {
            if (session?.user) session.user.role = token.role
            return session
        },
    },

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: "/auth/signIn",
    },

    // signInMethod: "email",
}
