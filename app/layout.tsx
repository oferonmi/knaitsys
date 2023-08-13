import './globals.css'
import { Inter } from 'next/font/google'
import { SessionProvider } from "next-auth/react"
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KAITO - Knowledge work AI tool',
  description: 'Your AI research assistant',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <SessionProvider> */}
          <Header />
          {children}
          <Footer />
        {/* </SessionProvider> */}
      </body>
    </html>
  )
}
