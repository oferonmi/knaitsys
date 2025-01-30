"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

const LogInButton = () => {
    return(
        <>
            <Link
                href="/api/auth/signin"
                className="flex text-gray-200 text-justify bg-kaito-brand-ash-green border border-kaito-brand-ash-green  hover:text-kaito-brand-ash-green  hover:bg-gray-100 focus:ring-1 focus:ring-teal-800 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green focus:outline-none dark:focus:ring-teal-800 gap-1"
            >
                Log In
            </Link>
        </>
    );
}

const LogOutButton = () => {
    return(
        <>
            <button
                onClick={ () => signOut({ callbackUrl: "/home",}) }
                className="flex text-gray-200 text-justify bg-kaito-brand-ash-green border border-kaito-brand-ash-green  hover:text-kaito-brand-ash-green  hover:bg-gray-100 focus:ring-1 focus:ring-teal-800 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green focus:outline-none dark:focus:ring-teal-800 gap-1"
            >
                Log Out
            </button>
        </>
    );
}

const SignUpButton = () => {
    return (
        <>
            <Link
                href="/home" 
                className=" flex text-kaito-brand-ash-green text-justify bg-gray-100 border border-kaito-brand-ash-green hover:text-gray-200  hover:bg-kaito-brand-ash-green focus:ring-1 focus:ring-teal-800 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green focus:outline-none dark:focus:ring-teal-800 gap-1"
            >
                Sign Up
            </Link>
        </>
    );
}

export { LogInButton, LogOutButton, SignUpButton };