import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kaitosys - Codebot",
  description: "AI coder",
};

export default function CodeBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={
          inter.className + " bg-gradient-to-r from-teal-100 to-teal-100"
        }
      >
        <Header menu={[]} />
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
