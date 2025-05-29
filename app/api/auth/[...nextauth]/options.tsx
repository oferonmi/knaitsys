import { Session } from "next-auth";
// import type  { AuthOptions }  from "next-auth/next";
import type { AdapterUser } from "@auth/core/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { GithubProfile } from "next-auth/providers/github";
import { GoogleProfile } from "next-auth/providers/google";
import { FacebookProfile } from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";

// Types
interface UserProfile {
    id: string;
    name: string;
    email?: string;
    image?: string;
    role: string;
}

type CustomAuthOptions = {
    providers: any[];
    callbacks: {
        jwt: (params: { token: JWT; user: any }) => Promise<JWT>;
        session: (params: {
        session: Session;
        token: JWT & { role?: string };
        user: UserProfile | AdapterUser | null;
        }) => Promise<Session>;
    };
    secret: string | undefined;
    pages: {
        signIn: string;
    };
};

// Constants
const DEFAULT_USER_ROLE = "user";
const REQUIRED_ENV_VARS = [
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "FACEBOOK_CLIENT_ID",
    "FACEBOOK_CLIENT_SECRET",
    "GITHUB_ID",
    "GITHUB_SECRET",
] as const;

// Environment validation
REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`Missing environment variable: ${envVar}`);
    }
});

export const authOptions: CustomAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { 
                    label: "Username", 
                    type: "text", 
                    placeholder: "jdoe" 
                },
                password: { 
                    label: "Password", 
                    type: "password" 
                },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                // TODO: Replace with actual database lookup
                const mockUser = { 
                    id: "0", 
                    name: "admin", 
                    password: "root", 
                    role: "admin" 
                };

                if (credentials.username === mockUser.name && 
                    credentials.password === mockUser.password) {
                    const { password, ...userWithoutPassword } = mockUser;
                    return userWithoutPassword;
                }
                
                return null;
            },
        }),

        // OAuth authentication providers...
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile: GoogleProfile): UserProfile {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: profile.role ?? DEFAULT_USER_ROLE,
                };
            },
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),

        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            profile(profile: FacebookProfile): UserProfile {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture.data.url,
                    role: profile.role ?? DEFAULT_USER_ROLE,
                };
            },
        }),

        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            profile(profile: GithubProfile): UserProfile {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    email: profile.email ?? undefined,
                    image: profile.avatar_url,
                    role: profile.role ?? DEFAULT_USER_ROLE,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }: { token: JWT; user: any }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },

        async session({ session, token, user}: { 
            session: Session, 
            token: JWT & { role?: string }, 
            user: AdapterUser | UserProfile | null 
        }) {
            // if (session?.user) {
            //     session.user.role = token.role;
            // }
            // return session;
            return{
                ...session,
                user: {
                    ...session.user,
                    role: token.role || DEFAULT_USER_ROLE,
                },
            }
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signIn",
    },
};
