import { Inter } from 'next/font/google'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { Footer } from '@/components/Footer'
import { ThemeScript } from '@/components/ThemeScript';

const inter = Inter({ subsets: ["latin"], weight: "300", });

export const metadata = {
  	title: "Knaitsys - Knowledge-work AI Tool System",
  	description: "AI tool system for your knowledge work",
};

export default function HomeLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<head />
			<body className={`${inter.className} bg-white dark:bg-gray-900 bg-cover bg-center`}>
				<ThemeScript />
				<HeaderWrapper menu={[]} />
				{children}
				<Footer />
			</body>
		</html>
	);
}
