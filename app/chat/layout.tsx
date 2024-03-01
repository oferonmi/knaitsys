import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Kaitosys - Chatbot",
  description: "AI chatbot",
};

export default function ChatBotLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body
        className={
          inter.className + " bg-gradient-to-r from-teal-100 to-teal-100"
        }
      >
        <Header
          menu={[
            { id: 1, value: "Text", url: "/text" },
            { id: 2, value: "Audio", url: "/audio" },
            { id: 2, value: "Code", url: "/code" },
          ]}
        />
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
