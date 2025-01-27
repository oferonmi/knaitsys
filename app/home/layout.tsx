import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ["latin"], weight: "300", });

export const metadata = {
  	title: "Knaitsys - Knowledge-work AI Tool System",
  	description: "AI tool system for your knowledge work",
};

export default function HomeLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-white bg-cover bg-center`}>
				<Header menu={[]} />
				{children}
				<Footer />
			</body>
		</html>
	);
}
