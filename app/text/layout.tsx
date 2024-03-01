import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kaitosys - Text",
  description: "Process text documents using NLP",
};

export default function textProcessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <Header menu={[]}/>
          {children}
          <Footer />
      </body>
    </html>
  );
}
