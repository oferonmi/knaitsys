import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], weight: "300", });

export const metadata = {
	title: "Knaitsys - Tools suite",
	description: "Menu of AI functionalities",
};

export default function ToolsMenuPageLayout({children,}: {children: React.ReactNode;}) {
  return (
    <html lang="en">
		<body className={`${inter.className} bg-teal-100 bg-cover bg-center`}>
			<Header menu={[]} />
			{children}
			<Footer />
		</body>
    </html>
  );
}
