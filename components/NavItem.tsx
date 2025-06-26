import { Tooltip } from "flowbite-react";

interface NavItemProps {
    icon: string;
    tooltip: string;
    onClick: () => void;
}

export const NavItem = ({ icon, tooltip, onClick }: NavItemProps) => (
    <li className="p-3">
        <Tooltip content={tooltip} className="inline-flex bg-black">
            <button
                className="inline-flex border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green bg-white dark:bg-gray-900 items-center font-semibold hover:text-gray-200 text-kaito-brand-ash-green  rounded-full px-4 py-3"
                type="button"
                onClick={onClick}
            >
                <i className={`bi ${icon}`}></i>
                <span className="sr-only">{tooltip}</span>
            </button>
        </Tooltip>
    </li>
);