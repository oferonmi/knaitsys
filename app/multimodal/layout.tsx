import { Inter } from "next/font/google";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ['latin'], weight: '300', })

export const metadata = {
  	title: "Knaitsys - Multimodal Bot",
  	description: "Multimodal AI Chatbot ",
};

export default function MutlimodalBotLayout({
  	children,
}: {
  	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-white bg-cover bg-center`}>
				<HeaderWrapper
					menu={[
						{ id: 1, value: "Text", url: "/text" },
						{ id: 2, value: "Audio", url: "/audio" },
						{ id: 3, value: "Code", url: "/code" },
					]}
				/>
				{children}
				{/* <Footer /> */}
			</body>
		</html>
	);
}
