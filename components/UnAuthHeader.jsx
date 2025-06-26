"use client";
import { usePathname } from 'next/navigation';
import { LogInButton, SignUpButton} from "../components/Buttons"

export const UnAuthHeader = () => {
    const pgPathName = usePathname();

    return (
        <header className="bg-gray-100 dark:bg-gray-900 px-4 py-2 ">
            <nav className="container mx-auto flex items-center justify-between">
                {pgPathName !== "/auth/signup" && (
                    <div className="flex items-center space-x-4">
                        <SignUpButton />
                    </div>
                )}

                {pgPathName !== "/auth/signIn" && (
                    <div>
                        <LogInButton />
                    </div>
                )}
            </nav>
        </header>
    );
}