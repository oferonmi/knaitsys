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
    <Link href={session ? "/ai_tools" : "/home"} className="py-1 w-auto h-auto focus:outline-none">
        <div className="flex items-center ml-1 gap-2">
            <Image 
                src="/knaitsys_logo_fig.svg" 
                priority
                alt="Knaitsys logo" 
                width={38} 
                height={38}
                className="select-none"
            />
            <span className={`${audiowide.className} font-bold text-3xl select-none`}>KnaitSys</span>
        </div>
    </Link>
);

export const Header = ({ menu, session }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    if (currentScrollY < lastScrollY || currentScrollY < 10) {
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                    setLastScrollY(currentScrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className="fixed w-full top-0 z-50">
            <header 
                className={`bg-gray-100 dark:bg-gray-900 w-full border-b border-gray-200 dark:border-gray-700 transform transition-all duration-200 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
                role="banner"
            >
                <nav className="container mx-auto px-4 py-2 flex items-center justify-between text-black dark:text-gray-100" aria-label="Main navigation">
                    <BrandLogo session={session} />
                    <MenuItems items={menu} />
                    {session ? <AuthHeader session={session}/> : <UnAuthHeader />}
                </nav>
            </header>
        </div>
    );
};