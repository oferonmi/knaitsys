"use client";
import { LogOutButton } from "../components/Buttons"

export const AuthHeader = () => {
    return (
        <div className="header">
            <nav className="bg-gray-100 w-full items-center space-x-6">

                <div className="md:flex md:items-center md:justify-between md:mx-auto">   
                    <div className="flex flex-row px-20">
                        <LogOutButton />
                    </div>
                </div>
                
            </nav>
        </div>
    );
}