import { Metadata } from 'next'
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: "300" });

export const metadata: Metadata = {
  title: "Knaitsys - Text to Speech",
  description: "Convert text to natural-sounding speech using AI",
};

export default function TTSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
