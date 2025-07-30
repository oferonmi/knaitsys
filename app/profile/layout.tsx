import React from 'react';
import NextAuthProvider from '@/context/NextAuthProvider';
import { Inter, Montserrat } from 'next/font/google'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { Footer } from '@/components/Footer'
import { ThemeScript } from '@/components/ThemeScript'

const inter = Inter({ subsets: ['latin'], weight: '300', })
const montserrat = Montserrat({ subsets: ["latin"], weight: "300", });

export const metadata = {
  title: 'Knaitsys - Profile',
  description: 'Manage your user profile and account settings',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <NextAuthProvider>
            <html lang="en">
                <head />
                <body className={`${montserrat.className} bg-white dark:bg-gray-900 bg-cover bg-center`}>
                    <ThemeScript />
                    <HeaderWrapper
                        menu={[
                        // { id: 1, value: "Home", url: "/" },
                        // { id: 2, value: "Chat", url: "/chat" },
                        // { id: 3, value: "Profile", url: "/profile" },
                        ]}
                    />
                    <main className="h-screen bg-white dark:bg-gray-900">{children}</main>
                    <Footer />
                </body>
            </html>
        </NextAuthProvider>
    );
}
