import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { AdapterUser } from "@auth/core/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { GithubProfile } from "next-auth/providers/github";
import { GoogleProfile } from "next-auth/providers/google";
import { FacebookProfile } from "next-auth/providers/facebook";

// Types
interface UserProfile {
    id: string;
    name: string;
    email?: string;
    image?: string;
    role: string;
}

// Define custom session type
interface CustomSession extends Session {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
    };
    accessToken?: string;
}

// Define custom token type
interface CustomToken extends JWT {
    accessToken?: string;
    id?: string;
    role: string;
}

// Define auth options type
interface CustomAuthConfig {
    providers: any[];
    callbacks: {
        jwt: (params: {
            token: CustomToken;
            user?: any;
            account?: any;
            profile?: any;
        }) => Promise<CustomToken>;
        session: (params: {
            session: CustomSession;
            token: CustomToken;
            user: AdapterUser | UserProfile;
        }) => Promise<CustomSession>;
    };
    secret?: string;
    pages: {
        signIn: string;
    };
}

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

export const authOptions: CustomAuthConfig = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                    placeholder: "jdoe",
                },
                password: {
                    label: "Password",
                    type: "password",
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
                    role: "admin",
                };

                if (
                    credentials.username === mockUser.name &&
                    credentials.password === mockUser.password
                ) {
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
                response_type: "code",
                },
            },
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
        async jwt({
            token,
            account,
            profile,
        }: {
            token: CustomToken;
            account?: any;
            profile?: any;
        }) {
        // If the user is signing in for the first time, add their profile info to the token
        if (account && profile) {
            token.accessToken = account.access_token;
            token.id = profile.id;
        }
        return token;
        },

        async session({
            session,
            token,
            user,
        }: {
            session: any;
            token: JWT & { role?: string };
            user: AdapterUser | UserProfile;
        }) {
            return {
                ...session,
                accessToken: token.accessToken,
                user: {
                ...session.user,
                id: token.id as string,
                role: token.role || DEFAULT_USER_ROLE,
                },
            };
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signIn",
    },
};
