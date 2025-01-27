import Link from "next/link"
// import HomeBgImg from "../public/d5-render-0NSnrDBogYg-unsplash.jpg"
import HomeBgImg from "@/public/understand_innovate_build_domain_bg_photo_14.jpg"

export const HomeContent = () => {
    return (
        <div className="bg-cover bg-center flex flex-col items-center justify-center text-white h-screen relative" style={{ backgroundImage: `url(${HomeBgImg.src})` }}>

            <h1 className="font-mono text-5xl text-white mt-30">
                {/* Craft your own AI Research Assistant. */}
                Use AI to understand, innovate and build.
            </h1>

            <p className="mt-2 text-3xl text-white">
                Adopt Natural Language Interface (NLI) and AI models for your knowledge work.
            </p>

            <Link
                href="/ai_tools"
                className="text-white text-justify font-medium text-sm bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none px-6 py-4 mt-2 rounded-full"
            >
                Get Started
            </Link>

        </div>
    )
}