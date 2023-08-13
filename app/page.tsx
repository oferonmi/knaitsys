import Image from 'next/image'
import { SessionProvider } from "next-auth/react"
import { HomeContent } from '../components/HomeContent'

export default async function Home() {
  return (
    <main>
      <HomeContent />
    </main>
  )
}