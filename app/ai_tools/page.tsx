'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css'

const styles = {
  container: "flex flex-col bg-teal-100 min-h-screen justify-center",
  header: "font-mono text-3xl text-gray-700 max-w-2xl pb-5 mx-auto mt-4 sm:px-4",
  description: "mt-2 text-xl text-black text-center",
  linkBase: "border-hidden border-8 hover:border-solid border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green transition-all"
}

export default function AiToolsPage() {
	const { status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/auth/signin')
		}
	}, [status, router])

	if (status === 'loading') {
		return (
			<div className={styles.container}>
				<span className="flex justify-center gap-2">
					<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
					Loading...
				</span>
			</div>
		)
	}

	return (
		<main className={styles.container}>
			<h1 className={styles.header}>AI Tools Kit</h1>

			<p className={styles.description}>
				Choose your preferred Natural Language Interface (NLI) mode for your knowledge work.
			</p>

			<div className="grid grid-flow-col justify-items-stretch place-items-center gap-4 max-w-2xl pb-5 mx-auto mt-4 sm:px-4 text-gray-700">
				<Link href="/text">
					<div className={styles.linkBase}>
						<i className="bi bi-file-text-fill" style={{ fontSize: 64 }}></i>
						<p>Text</p>
					</div>
				</Link>

				<Link href="/audio">
					<div className={styles.linkBase}>
						<i className="bi bi-soundwave" style={{ fontSize: 64 }}></i>
						<p>Audio</p>
					</div>
				</Link>

				<Link href="/multimodal">
					<div className={styles.linkBase}>
						<i className="bi bi-disc-fill" style={{ fontSize: 64 }}></i>
						<p>Multimodal</p>
					</div>
				</Link>

				<Link href="/code">
					<div className={styles.linkBase}>
						<i className="bi bi-file-code-fill" style={{ fontSize: 64 }}></i>
						<p>Code</p>
					</div>
				</Link>
				
				<Link href="/#">
					<div className={styles.linkBase}>
						<i className="bi bi-robot" style={{ fontSize: 64 }}></i>
						<p>Agent</p>
					</div>
				</Link>

				<Link href="/#">
					<div className={styles.linkBase}>
						<i className="bi bi-globe-europe-africa" style={{ fontSize: 64 }}></i>
						<p>Simulation</p>
					</div>
				</Link>
			</div>
		</main>
	)
}
