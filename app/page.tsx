import { authOptions } from "./api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"
import { HomeContent } from '../components/HomeContent'

export default async function Home() {
   
  const session = await getServerSession(authOptions)
  
  return (
    <main>
      <HomeContent />
    </main>
  )
}