import { FacebookIcon, InstagramIcon, XIcon, GitHubIcon, YoutubeIcon } from '@/components/Icons'

export const Footer = () => {
   return (
        <>
            <footer className="border-t border-t-gray-200 dark:border-t-gray-700">
                <div className="px-4 py-6 bg-kaito-brand-gray dark:bg-gray-900 md:flex md:items-center md:justify-between md:mx-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-300 sm:text-center">
                        Copyright © {new Date().getFullYear()} <a href="#">Gutenkraft Technologies Research</a>
                    </span>
                    <div className="flex mt-4 space-x-6 sm:justify-center md:mt-0">
                        <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <FacebookIcon />
                            <span className="sr-only">Facebook page</span>
                        </a>
                        <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <InstagramIcon />
                            <span className="sr-only">Instagram page</span>
                        </a>
                        <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <XIcon />
                            <span className="sr-only">Twitter/X page</span>
                        </a>
                        <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <YoutubeIcon />
                            <span className="sr-only">Youtube channel</span>
                        </a>
                        <a href="#" className="text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <GitHubIcon />
                            <span className="sr-only">GitHub account</span>
                        </a>
                    </div>
                </div>
            </footer>
        </>
   ); 
}