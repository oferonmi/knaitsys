"use client";
import { LogOutButton } from "../components/Buttons"

export const AuthHeader = () => {
    return (
        <div className="header">
            <nav className="flex flex-row bg-gray-100 w-full items-center space-x-6  justify-between  mr-2.5">
                <LogOutButton />
            </nav>
        </div>
    );
}