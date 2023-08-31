import Link from "next/link"
import HomeBgImg from "../public/d5-render-0NSnrDBogYg-unsplash.jpg"

export const HomeContent = () => {
    return (
        <div className="bg-cover bg-center flex flex-col items-center justify-center text-white h-screen relative" style={{ backgroundImage: `url(${HomeBgImg.src})` }}>

            <h1 className="font-mono text-5xl text-white mt-30">
                Craft your own AI Research Assistant.
            </h1>

            <p className="mt-2 text-xl text-black">
                Use Natural Language Interface (NLI) for your knowledge work.
            </p>

            <Link
                href="/api/auth/signin"
                className="text-white text-justify font-medium text-sm bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none px-6 py-4 mt-2 rounded-full"
            >
                Get Started
            </Link>

        </div>
    )
}