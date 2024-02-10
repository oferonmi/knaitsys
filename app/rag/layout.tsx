import "app/globals.css";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kaitosys - RAG",
  description: "Query text documents using NLP",
};

export default function ragChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <Header menu={[{id:1, value:'Tools', url:'/ai_tools'}, {id:2, value:'Upload', url:'/rag'}]} />
          {children}
          <Footer />
      </body>
    </html>
  );
}
