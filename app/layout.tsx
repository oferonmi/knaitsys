import './globals.css';
import { Inter } from 'next/font/google';
// import { Ubuntu_Mono } from "next/font/google";
import NextAuthProvider from '@/context/NextAuthProvider';

const inter = Inter({ subsets: ['latin'], weight: '300', })
// const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"] });

export const metadata = {
  title: 'Knaitsys - Knowledge-work AI Tools System',
  description: 'Your AI tools kit',
}

export default function RootPageLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-teal-100 bg-cover bg-center`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
