import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Kaitosys - Knowledge-work AI Tools System",
  description: "Your AI tools kit",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <Header menu={[]}/>
          {children}
          <Footer />
      </body>
    </html>
  )
}
