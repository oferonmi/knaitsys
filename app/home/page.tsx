import { HomeContent } from '@/components/HomeContent'
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";


export default async function Home() {
	const session = await getServerSession(authOptions);
	
	if (session) {
		redirect("/ai_tools");
	}

	return <main><HomeContent /></main>;
}