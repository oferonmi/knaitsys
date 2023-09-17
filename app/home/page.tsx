import { HomeContent } from '../../components/HomeContent'
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";


export default async function Home() {

  const session = await getServerSession(authOptions);

  return <main>{session ? redirect("/ai_tools") : <HomeContent />}</main>;
}