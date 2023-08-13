import Link from "next/link"
import Image from "next/image"
import HomeBgImg from "../public/d5-render-0NSnrDBogYg-unsplash.jpg"

export const HomeContent = () => {
    return (
        <div className="bg-cover bg-center flex flex-col items-center justify-center text-white h-screen relative" style={{ backgroundImage: `url(${HomeBgImg.src})` }}>

            <h1 className="font-mono text-5xl mt-30">
                Craft your own AI Research Assistant.
            </h1>

            <p className="mt-2 text-xl">
                Use Natural Language Interface (NLI) for your knowledge work.
            </p>

            <Link
                href="/"
                className="text-white text-justify font-medium text-sm bg-black hover:bg-gray-800 focus:ring-4 dark:bg-black dark:hover:bg-gray-800 focus:outline-none dark:focus:ring-gray-800 px-6 py-4 mt-2 rounded-full"
            >
                Get Started
            </Link>

        </div>
    )
}