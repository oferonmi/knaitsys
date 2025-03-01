'use client'

import Link from 'next/link'
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css'
import { withAuth } from "@/components/HOC/withAuth"

const styles = {
	container: "flex flex-col min-h-screen justify-center",
	header: "font-mono text-3xl text-gray-700 max-w-2xl pb-5 mx-auto mt-4 sm:px-4",
	description: "mt-2 text-xl text-black text-center",
	linkBase: "border-hidden border-8 hover:border-solid border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green transition-all text-kaito-brand-ash-green p-4",
	textBase: "text-center text-lg ",
}

function AiToolsPage() {
	return (
		<main className={styles.container}>
			<h1 className={styles.header}>AI Toolkit</h1>

			<p className={styles.description}>
				Choose your preferred Natural Language Interface (NLI) mode for your
				knowledge work.
			</p>

			<div className="grid grid-flow-col justify-items-stretch place-items-center gap-4 max-w-2xl pb-5 mx-auto mt-4 sm:px-4 text-gray-700">
				<Link href="/text">
					<div className={styles.linkBase}>
						<i className="bi bi-file-text-fill" style={{ fontSize: 64 }}></i>
						<p className={styles.textBase}>Text</p>
					</div>
				</Link>

				<Link href="/audio">
					<div className={styles.linkBase}>
						<i className="bi bi-soundwave" style={{ fontSize: 64 }}></i>
						<p className={styles.textBase}>Audio</p>
					</div>
				</Link>

				<Link href="/multimodal">
					<div className={styles.linkBase}>
						<i className="bi bi-disc-fill" style={{ fontSize: 64 }}></i>
						<p className={styles.textBase}>Multimodal</p>
					</div>
				</Link>

				<Link href="/code">
					<div className={styles.linkBase}>
						<i className="bi bi-file-code-fill" style={{ fontSize: 64 }}></i>
						<p className={styles.textBase}>Code</p>
					</div>
				</Link>

				<Link href="/#">
					<div className={styles.linkBase}>
						<i className="bi bi-robot" style={{ fontSize: 64 }}></i>
						<p className={styles.textBase}>Agent</p>
					</div>
				</Link>

				<Link href="/simulator">
					<div className={styles.linkBase}>
						<i
							className="bi bi-globe-europe-africa"
							style={{ fontSize: 64 }}
						></i>
						<p className={styles.textBase}>Simulation</p>
					</div>
				</Link>
			</div>
		</main>
	);
}

export default withAuth(AiToolsPage)
