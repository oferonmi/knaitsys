import { motion } from 'framer-motion'
import Link from 'next/link'
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css'

interface ToolList {
	id: string
	title: string
	description: string
	icon: string
	path: string
}

const listStyles = {
	grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
	card: "p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow",
	icon: "text-3xl text-kaito-brand-ash-green mb-4",
	title: "text-xl font-semibold text-gray-800 mb-2",
	description: "text-gray-600"
} as const

function ToolsList({ tools }: { tools: ToolList[] }) {
    return (
        <div className={listStyles.grid}>
            {tools.map((tool) => (
                <motion.div
                    key={tool.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Link href={tool.path}>
                        <div className={listStyles.card}>
                            <i className={`${listStyles.icon} ${tool.icon}`} aria-hidden="true" />
                            <h2 className={listStyles.title}>{tool.title}</h2>
                            <p className={listStyles.description}>{tool.description}</p>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    )
}

export {ToolsList, type ToolList}