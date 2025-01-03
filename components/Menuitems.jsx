// Server Component
import Link from "next/link";

export const MenuItems = ({ items }) => {
    if (!items?.length) return null;

    return (
        <div className="flex flex-row gap-4">
            {items.map((item) => (
                <Link 
                    key={item.id} 
                    href={item.url} 
                    className="text-black hover:text-gray-600 transition-colors"
                    prefetch={false}
                >
                    {item.value}
                </Link>
            ))}
        </div>
    );
}; 