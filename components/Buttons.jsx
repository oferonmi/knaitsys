"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

const LogInButton = () => {
    return(
        <>
            <Link
                href="/api/auth/signin"
                className="flex font-bold text-gray-200 dark:text-gray-100 text-justify bg-kaito-brand-ash-green border border-kaito-brand-ash-green hover:text-kaito-brand-ash-green dark:hover:text-kaito-brand-ash-green hover:bg-gray-100 dark:hover:bg-gray-900 focus:ring-1 focus:ring-teal-800 rounded-lg text-sm px-5 py-2 mr-2 mb-2 dark:bg-kaito-brand-ash-green dark:focus:ring-teal-800 focus:outline-none gap-1"
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
                className="flex font-bold text-gray-200 dark:text-gray-100 text-justify bg-kaito-brand-ash-green border border-kaito-brand-ash-green hover:text-kaito-brand-ash-green dark:hover:text-kaito-brand-ash-green hover:bg-gray-100 dark:hover:bg-gray-900 focus:ring-1 focus:ring-teal-800 rounded-lg text-sm px-5 py-2 mr-2 mb-2 dark:bg-kaito-brand-ash-green dark:focus:ring-teal-800 focus:outline-none gap-1"
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
                href="/auth/signup" 
                className="flex font-bold text-kaito-brand-ash-green dark:text-gray-100 text-justify bg-gray-100 dark:bg-gray-900 border border-kaito-brand-ash-green hover:text-gray-200 dark:hover:text-gray-200 hover:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green focus:ring-1 focus:ring-teal-800 rounded-lg text-sm px-5 py-2 mr-2 mb-2 dark:focus:ring-teal-800 focus:outline-none gap-1"
            >
                Sign Up
            </Link>
        </>
    );
}

export { LogInButton, LogOutButton, SignUpButton };