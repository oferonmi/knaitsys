import 'app/globals.css'
import { Inter } from 'next/font/google'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KAITOSYS - Authentication',
  description: 'Your AI tools kit',
}

export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <Header />
          {children}
          <Footer />
      </body>
    </html>
  )
}
