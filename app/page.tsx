import { authOptions } from "./api/auth/[...nextauth]/options"
import { HomeContent } from '../components/HomeContent'

export default async function Home() {
  return (
    <main>
      <HomeContent />
    </main>
  )
}