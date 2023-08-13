// 'use client'
import Link from "next/link"
import Image from "next/image"
import Logo from "../public/kaito_app_logo.png"
// import { useSession, signIn, signOut } from 'next-auth/react'

export const Header = () => {
    // const { data: session } = useSession();

    const handleSignin = (e) => {
        e.preventDefault();
        signIn();
    };

    const handleSignout = (e) => {
        e.preventDefault();
        signOut();
    };

    return (
        <div className="header">
            <nav className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 w-full items-center space-x-6"> {/*z-20 fixed*/}

                <div className="md:flex md:items-center md:justify-between md:mx-auto">

                    <div className="flex flex-row">
                        <Link href="/" passHref className="px-20 py-1 w-auto h-auto">
                            <Image src="/kaito_app_logo.png" alt="App logo" width={199} height={115} />
                        </Link>
                    </div>

                    <div className="flex flex-row px-20">
                        <Link
                            href="/api/auth/signin"
                            className="flex text-white text-justify bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1"
                        >
                            Log In
                        </Link>

                        <Link
                            href="/" 
                            className=" flex text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1"
                        >
                            Sign Up
                        </Link>   
                    </div>
                </div>
                
            </nav>
        </div>
    )
}