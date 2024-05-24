import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ["latin"], weight: "300" });

export const metadata = {
  title: 'Kaitosys - Log In',
  description: 'Your AI tools kit',
}

export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <Header menu={[]} />
          {children}
          <Footer />
      </body>
    </html>
  )
}
