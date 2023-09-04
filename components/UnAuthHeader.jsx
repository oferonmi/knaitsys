"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export const UnAuthHeader = () => {
    const pgPathName = usePathname();

    return (
        <div className="header">
            <nav className="bg-white border-gray-200 w-full items-center space-x-6"> {/*z-20 fixed*/}

                <div className="md:flex md:items-center md:justify-between md:mx-auto">
                    {/* <div>page path: {pgPathName}</div> */}
                    <div className="flex flex-row px-20">
                        {pgPathName != "/auth/signIn"?(
                        <Link
                            href="/api/auth/signin"
                            className="flex text-white text-justify bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1"
                        >
                            Log In
                        </Link>
                        ):(
                            <></>
                        )}

                        <Link
                            href="/home" 
                            className=" flex text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1"
                        >
                            Sign Up
                        </Link>   
                    </div>    
                </div>
                
            </nav>
        </div>
    );
}