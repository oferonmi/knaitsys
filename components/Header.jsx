'use client';

import Image from "next/image";
import Link from "next/link";
import { Marcellus_SC, Audiowide, Gugi, Hubot_Sans } from 'next/font/google'
import { AuthHeader } from "@/components/AuthHeader";
import { UnAuthHeader } from "@/components/UnAuthHeader";
import { MenuItems } from "@/components/Menuitems";
import { useState, useEffect } from "react";

const hubotSans = Hubot_Sans({ subsets: ["latin"], weight: "200", });
const audiowide = Audiowide({ subsets: ["latin"], weight: "400", });

const BrandLogo = ({ session }) => (
    <Link href={session ? "/ai_tools" : "/home"} className="py-1 w-auto h-auto">
        <div className="flex items-center ml-1">
            {/* <Image 
                src="/knaitsys_v3.png" 
                priority
                alt="Knaitsys logo" 
                width={330} 
                height={115}
            /> */}
            <Image 
                src="/knaitsys_logo_fig.svg" 
                priority
                alt="Knaitsys logo" 
                width={38} 
                height={38}
            />
            <div className={`${audiowide.className} font-bold text-3xl pl-3`}>KnaitSys</div>
        </div>
    </Link>
);

export const Header = ({ menu, session }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    
    useEffect(() => {
        const controlHeader = () => {
            const currentScrollY = window.scrollY;
            
            // Show header immediately when scrolling up or at top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        // Add scroll event with debounce for performance
        let timeoutId;
        const onScroll = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(controlHeader, 50);
        };

        window.addEventListener('scroll', onScroll);
        
        // Cleanup
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [lastScrollY]);

    return (
        <div className="fixed w-full top-0 z-50">
            <header 
                className={`
                    bg-gray-100 dark:bg-gray-900 w-full border-b border-gray-200 dark:border-gray-700
                    transform transition-all duration-200
                    ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
                `}
            >
                <nav className="container mx-auto px-4 py-2 md:flex md:items-center md:justify-between text-black dark:text-gray-100">
                    <BrandLogo session={session} />
                    <MenuItems items={menu} /> 
                    {session ? <AuthHeader session={session}/> : <UnAuthHeader />}
                </nav>
            </header>
        </div>
    );
};