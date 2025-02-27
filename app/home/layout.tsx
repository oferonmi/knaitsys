import { Inter } from 'next/font/google'
import { HeaderWrapper } from '@/components/HeaderWrapper'
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
				<HeaderWrapper menu={[]} />
				{children}
				<Footer />
			</body>
		</html>
	);
}
