import { Inter, Montserrat } from "next/font/google";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({ subsets: ["latin"], weight: "300" });
const montserrat = Montserrat({ subsets: ["latin"], weight: "300", });

export const metadata = {
  title: "Knaitsys - Retrieval",
  description: "Query text documents by leveraging LLMs",
};

export default function RetrievalPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={`${montserrat.className} bg-white dark:bg-gray-900 bg-cover bg-center`}>
        <ThemeScript />
        <HeaderWrapper
          menu={[
            // { id: 1, value: "Text", url: "/text" },
            // { id: 2, value: "Audio", url: "/audio" },
            // { id: 3, value: "Code", url: "/code" },
          ]}
        />
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
