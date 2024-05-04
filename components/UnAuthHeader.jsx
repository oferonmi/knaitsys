"use client";
import { usePathname } from 'next/navigation';
import { LogInButton, SignUpButton} from "../components/Buttons"

export const UnAuthHeader = () => {
    const pgPathName = usePathname();

    return (
        <div className="header">
            <nav className="flex flex-row bg-gray-100 w-full items-center space-x-6 justify-between">
                {pgPathName != "/auth/signIn"?(
                    <LogInButton />
                ):(
                    <></>
                )}
                <div className="md:mr-2.5">
                    <SignUpButton />
                </div>
            </nav>
        </div>
    );
}