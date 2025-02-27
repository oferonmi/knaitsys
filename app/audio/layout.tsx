import { Inter } from "next/font/google";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], weight: "300" });

export const metadata = {
  title: "Knaitsys - Audio",
  description: "Process and generate audio documents using NLI",
};

export default function audioProcessorLayout({
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
