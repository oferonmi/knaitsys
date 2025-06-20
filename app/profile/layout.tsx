import React from 'react';
import NextAuthProvider from '@/context/NextAuthProvider';
import { Inter } from 'next/font/google'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], weight: '300', })

export const metadata = {
  title: 'Profile | Knaitsys',
  description: 'Manage your user profile and account settings',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <NextAuthProvider>
            <html lang="en">
                <body className={`${inter.className} bg-white bg-cover bg-center`}>
                    <HeaderWrapper
                        menu={[
                        // { id: 1, value: "Home", url: "/" },
                        // { id: 2, value: "Chat", url: "/chat" },
                        // { id: 3, value: "Profile", url: "/profile" },
                        ]}
                    />
                    <main className="h-screen">{children}</main>
                    <Footer />
                </body>
            </html>
        </NextAuthProvider>
    );
}
