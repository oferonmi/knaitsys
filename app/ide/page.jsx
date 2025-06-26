'use client';

import { useState } from 'react';
import FileExplorer from '@/components/FileExplorer';
import MonacoEditor from '@/components/Editor';
import Terminal from '@/components/Terminal';

export default function Home() {
	const [output, setOutput] = useState('');

	return (
		<div className="flex h-screen bg-white dark:bg-gray-900 text-black dark:text-gray-100">
			{/* File Explorer */}
			<div className="w-1/4 bg-white dark:bg-gray-800 p-4 overflow-auto">
				<FileExplorer />
			</div>
			{/* Editor, Output, and Terminal */}
			<div className="w-3/4 flex flex-col">
				<div className="flex-1">
					<MonacoEditor setOutput={setOutput} />
				</div>
				<div className="h-1/4 bg-gray-200 dark:bg-gray-700 p-4 overflow-auto">
					<h3 className="text-lg font-bold mb-2">Output</h3>
					<pre className="text-sm">{output || 'No output yet'}</pre>
				</div>
				<div className="h-1/3 bg-black dark:bg-gray-900">
					<Terminal />
				</div>
			</div>
		</div>
	);
}