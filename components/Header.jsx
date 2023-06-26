// import { Container } from '@/components'
import Link from "next/link"
import Image from "next/image"

export const Header = () => {
    return (
        <>
            <nav className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 z-20 fixed w-full md:items-center space-x-6">
                <div className="md:flex md:items-center md:justify-between md:mx-auto">
                    <Link href="/" className="md:px-20">
                        <Image src="/kaito_app_logo.png" alt="App logo" width={199} height={110} />
                    </Link>

                    <div className="flex flex-row md:px-20">
                        <Link
                            href="/"
                            className="flex text-white text-justify bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1"
                        >
                            Log in
                        </Link>

                        <Link
                            href="/"
                            className=" flex text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1"
                        >
                            Sign up
                        </Link>
                    </div>

                </div>
            </nav>
        </>
    )
}