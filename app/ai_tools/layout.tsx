import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kaitosys - Tools suite",
  description: "Menu of AI functionalities",
};

export default function aiAssistantLayout({
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
