import { FacebookIcon, InstagramIcon, XIcon, GitHubIcon, YoutubeIcon } from '@/components/Icons'

export const Footer = () => {
   return (
    <>
        <footer className="bg-white">
            <div className="px-4 py-6 bg-gray-100 md:flex md:items-center md:justify-between md:mx-auto">
                <span className="text-sm text-gray-500 sm:text-center">
                    <a href="#">Gutenkraft Labs</a> © 2023 
                </span>
                <div className="flex mt-4 space-x-6 sm:justify-center md:mt-0">
                    <a href="#" className="text-gray-400 hover:text-gray-900">
                        <FacebookIcon />
                        <span className="sr-only">Facebook page</span>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-900">
                        <InstagramIcon />
                        <span className="sr-only">Instagram page</span>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-900">
                        <XIcon />
                        <span className="sr-only">Twitter/X page</span>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-900">
                        <YoutubeIcon />
                        <span className="sr-only">Youtube channel</span>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-900">
                        <GitHubIcon />
                        <span className="sr-only">GitHub account</span>
                    </a>
                </div>
            </div>
        </footer>
    </>
   ) 
}