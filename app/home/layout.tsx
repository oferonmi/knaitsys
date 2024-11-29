import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Knaitsys - Knowledge-work AI Tool System",
  description: "AI tool system for your knowledge work",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-teal-100 bg-cover bg-center`}>
        <Header menu={[]} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
