import "app/globals.css";
import { Inter } from "next/font/google";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
// import NextAuthProvider from "../../context/NextAuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "KAITO - AI tools kit",
  description: "Your AI research assistant",
};

export default function aiAssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <NextAuthProvider> */}
          <Header />
          {children}
          <Footer />
        {/* </NextAuthProvider> */}
      </body>
    </html>
  );
}
