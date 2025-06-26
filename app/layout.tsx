import './globals.css';
import { Inter } from 'next/font/google';
// import { Ubuntu_Mono } from "next/font/google";
import NextAuthProvider from '@/context/NextAuthProvider';
import { ThemeScript } from '@/components/ThemeScript';

const inter = Inter({ subsets: ['latin'], weight: '300', })
// const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"] });

export const metadata = {
	title: 'Knaitsys - Knowledge-work AI Tools System',
	description: 'AI tools kit for your knowledge work',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<NextAuthProvider>
			<ThemeScript />
			{children}
		</NextAuthProvider>
	);
}
