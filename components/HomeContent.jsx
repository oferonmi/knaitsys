import Link from "next/link"
import Image from "next/image"

export const HomeContent = () => {
    return (
        <div className="md:flex md:flex-col md:items-center md:justify-between md:relative">
            <img src="/home_content_pix_milad_fakurian.jpg" alt="yellow and white balloons on orange surface" />
            <div className="md:h-screen md:flex md:flex-col md:items-center md:justify-center md:absolute">
                <h1 className="font-mono text-5xl mt-40">Craft your own AI based Research Assistant.</h1>
                <p className="mt-2 text-xl">Use Natural Language Interface (NLI) for your knowlege work.</p>
                <Link
                    href="/"
                    className="text-white text-justify font-medium text-sm bg-black hover:bg-gray-800 focus:ring-4 dark:bg-black dark:hover:bg-gray-800 focus:outline-none dark:focus:ring-gray-800 px-6 py-3 mt-2 rounded-full"
                >
                    Get Started
                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15|3-3m0 0|-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg> */}
                </Link>
            </div>
            
        </div>
    )
}