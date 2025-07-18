import { HomeContent } from '@/components/HomeContent'
import Link from "next/link";
import HomeBgImg from "@/public/understand_innovate_build_domain_bg_photo_14.jpg";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";


export default async function Home() {
	const session = await getServerSession(authOptions as any);
	
	if (session) {
		redirect("/ai_tools");
	}

	return (
		<main>
			{/* <HomeContent /> */}
			<div
				className="bg-cover bg-center flex flex-col items-center justify-center text-white dark:text-gray-100 h-screen relative pt-40"
				style={{ backgroundImage: `url(${HomeBgImg.src})` }}
			>
				<h1 className="font-mono text-5xl text-white dark:text-gray-100 mt-30">
					Use AI to understand, innovate and build.
				</h1>

				<p className="mt-2 text-3xl text-white dark:text-gray-200">
					Transform your knowledge work using AI models!
				</p>

				<Link
					href="/ai_tools"
					className="text-white dark:text-gray-100 text-justify font-medium text-sm bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-900 focus:ring-4 focus:outline-none px-6 py-4 mt-2 rounded-full"
				>
					Get Started
				</Link>
			</div>
		</main>
	);
}