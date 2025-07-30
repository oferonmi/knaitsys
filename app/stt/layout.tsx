import { Metadata } from "next";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { Inter, Montserrat } from "next/font/google";
import { ThemeScript } from '@/components/ThemeScript';

const inter = Inter({ subsets: ["latin"], weight: "300" });
const montserrat = Montserrat({ subsets: ["latin"], weight: "300", });

export const metadata: Metadata = {
  title: "Knaitsys - Speech to Text",
  description: "Convert natural-sounding speech to text using AI",
};

export default function STTLayout({ children }: { children: React.ReactNode }) {
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
