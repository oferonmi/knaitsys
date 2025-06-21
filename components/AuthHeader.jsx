"use client";
import { LogOutButton } from "@/components/Buttons"
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export const AuthHeader = ({session}) => {
    const { name, email, image } = session?.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="header">
            <nav className="flex flex-row bg-gray-100 w-full items-center space-x-6  justify-between  mr-2.5">
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen((v) => !v)} aria-label="User menu">
                        <Image 
                            width={38}
                            height={38}
                            src={image ? image : "/avatars/default_user_avatar.JPG"}
                            alt="User avatar"
                            className="w-9 h-9 rounded-full  border border-1 border-gray-300 dark:border-gray-700"
                        />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-sm divide-y divide-gray-100 dark:bg-gray-700 dark:divide-gray-600">
                            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                <div className="font-semibold mb-1">
                                    {name}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300 mb-1 truncate">{email}</div>
                            </div>
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownProfileButton">
                                <li>
                                    <Link href="/ai_tools" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                        Tools
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                        Profile
                                    </Link>
                                </li>
                            </ul>
                            <div className ="py-1">
                                <button
                                    onClick={ () => signOut({ callbackUrl: "/home",}) }
                                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                                >
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
}