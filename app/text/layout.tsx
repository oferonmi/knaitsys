import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], weight: "300", });

export const metadata: Metadata = {
  title: "Knaitsys - Text",
  description: "Process text documents using NLI",
};

export default function textProcessorLayout({
  	children,
}: {
  	children: React.ReactNode;
}) {
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
