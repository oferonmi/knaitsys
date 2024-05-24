import './globals.css';
import { Inter } from 'next/font/google';
// import { Ubuntu_Mono } from "next/font/google";
import NextAuthProvider from '@/context/NextAuthProvider';


const inter = Inter({ subsets: ['latin'], weight: '300', })
// const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"] });


export const metadata = {
  title: 'Kaitosys - Knowledge-work AI Tools System',
  description: 'Your AI tools kit',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body
        className={
          inter.className + " bg-gradient-to-r from-teal-100 to-teal-100"
        }
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
