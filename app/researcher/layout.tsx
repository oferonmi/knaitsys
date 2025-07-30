import { Inter, Montserrat } from "next/font/google";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { ThemeScript } from '@/components/ThemeScript';

const inter = Inter({ subsets: ["latin"], weight: "300", });
const montserrat = Montserrat({ subsets: ["latin"], weight: "300", });

export const metadata = {
	title: "Knaitsys - AI Researcher",
	description: "AI-powered research tools and resources",
};

export default function ToolsMenuPageLayout({children,}: {children: React.ReactNode;}) {
	return (
		<html lang="en">
			<head />
			<body className={`${montserrat.className} bg-white dark:bg-gray-900 bg-cover bg-center`}>
				<ThemeScript />
				<HeaderWrapper menu={[]} />
				{children}
				<Footer />
			</body>
		</html>
	);
}
