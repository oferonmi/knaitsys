import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
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
      <body className={`${inter.className} bg-teal-100 bg-cover bg-center`}>
        <Header
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
