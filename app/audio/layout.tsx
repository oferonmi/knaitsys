import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Knaitsys - Audio",
  description: "Process Audio using AI",
};

export default function audioPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header menu={[]} />
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
