import NextAuth, {NextAuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

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
                // retreive user data to credential verification
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

                const user = { id: "0", name: "admin", password: "root" }

                if (credentials?.username === user.name && credentials?.password === user.password) {
                    return user
                } else {
                    return null
                }
            },
        }),

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
    ],

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: "/auth/signIn",
    },

    // signInMethod: "email",
}
