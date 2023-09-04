"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

export const AuthHeader = () => {
    return (
        <div className="header">
            <nav className="bg-white border-gray-200  w-full items-center space-x-6"> {/*z-20 fixed*/}

                <div className="md:flex md:items-center md:justify-between md:mx-auto">
                    
                    <div className="flex flex-row px-20">
                        <button
                            // href="/api/auth/signout"
                            onClick={ () => signOut({ callbackUrl: "/home",}) }
                            className="flex text-white text-justify bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
                
            </nav>
        </div>
    );
}