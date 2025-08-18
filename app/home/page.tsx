import Link from "next/link";
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
				className={"bg-cover bg-center flex flex-col items-center justify-center text-white dark:text-gray-100 h-screen relative  pt-10 bg-gray-400 bg-blend-multiply"}
				style={{ backgroundImage: "url('/understand_innovate_build_domain_bg_photo_23.jpg')" }}
			>
				<div className="items-center justify-center text-center">
					<h1 className="text-5xl text-white font-bold dark:text-gray-100 mt-30">
						AI platform for Research & Engineering.
					</h1>

					<p className="mt-2 mb-5 text-3xl text-white dark:text-gray-200">
						Understand, innovate and build using AI! Transform your knowledge work.
					</p>

					<Link
						href="/ai_tools"
						className="text-white dark:text-gray-100 text-justify font-medium text-lg  bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-900 focus:ring-4 focus:outline-none px-6 py-4 rounded-full"
					>
						Get Started
					</Link>
				</div>
			</div>
		</main>
	);
}