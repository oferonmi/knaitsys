"use client";
import { usePathname } from 'next/navigation';
import { LogInButton, SignUpButton} from "../components/Buttons"

export const UnAuthHeader = () => {
    const pgPathName = usePathname();

    return (
        <div className="header">
            <nav className="flex flex-row bg-gray-100 w-full items-center space-x-6 justify-between mx-auto">
                {pgPathName != "/auth/signIn"?(
                    <LogInButton />
                ):(
                    <></>
                )}

                <SignUpButton />
            </nav>
        </div>
    );
}