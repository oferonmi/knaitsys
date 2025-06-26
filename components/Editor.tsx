'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useFileSystem } from '@/lib/fileSystem';

const getLanguage = (filename: string): string => {
	const ext = filename.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'js':
		case 'jsx':
		return 'javascript';
		case 'ts':
		case 'tsx':
		return 'typescript';
		case 'py':
		return 'python';
		case 'html':
		return 'html';
		case 'css':
		return 'css';
		case 'json':
		return 'json';
		default:
		return 'plaintext';
	}
};

export default function MonacoEditor({ setOutput }: { setOutput: (output: string) => void }) {
	const { currentFile, setCurrentFile } = useFileSystem();
	const [value, setValue] = useState(currentFile?.content || '// Start coding here\n');

	const handleEditorChange = (newValue: string | undefined) => {
		if (newValue) {
			setValue(newValue);
			if (currentFile) {
				setCurrentFile({ ...currentFile, content: newValue });
			}
		}
	};

	const runCode = useCallback(() => {
		if (!currentFile || getLanguage(currentFile.name) !== 'javascript') {
			setOutput('Only JavaScript execution is supported.');
			return;
		}

		try {
			// Create an iframe for sandboxed execution
			const iframe = document.createElement('iframe');
			iframe.style.display = 'none';
			document.body.appendChild(iframe);

			// Capture console.log
			let output = '';
			const originalConsoleLog = console.log;
			console.log = (...args) => {
				output += args.join(' ') + '\n';
				originalConsoleLog(...args);
			};

			// Execute code in iframe
			const script = iframe.contentWindow!.document.createElement('script');
			script.textContent = currentFile.content || '';
			iframe.contentWindow!.document.body.appendChild(script);

			// Wait briefly to capture output
			setTimeout(() => {
				console.log = originalConsoleLog;
				setOutput(output || 'No output');
				document.body.removeChild(iframe);
			}, 100);
		} catch (error) {
			setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}, [currentFile, setOutput]);

	const options = {
		theme: 'vs-dark',
		automaticLayout: true,
		minimap: { enabled: true },
		lineNumbers: 'on' as const,
		folding: true,
		wordWrap: 'on' as const,
		scrollBeyondLastLine: false,
		renderWhitespace: 'selection' as 'selection',
		fontSize: 14,
		tabSize: 4,
		insertSpaces: true,
		detectIndentation: true,
		quickSuggestions: true,
		parameterHints: { enabled: true },
		formatOnType: true,
		formatOnPaste: true,
		multiCursorModifier: 'alt' as 'alt',
		bracketPairColorization: { enabled: true },
		codeLens: true,
		contextmenu: true,
		find: { addExtraSpaceOnTop: true, autoFindInSelection: 'always' as const },
		suggest: { showIcons: true, showStatusBar: true },
		renderLineHighlight: 'all' as const,
		mouseWheelZoom: true,
	};

	return (
		<div className="h-full flex flex-col">
			<div className="flex justify-end p-2 bg-white dark:bg-gray-900">
				<button
					onClick={runCode}
					className="px-4 py-2 bg-kaito-brand-ash-green  hover:bg-kaito-brand-gray  rounded text-white"
					disabled={!currentFile || getLanguage(currentFile.name) !== 'javascript'}
				>
					Run Code
				</button>
			</div>
			<Editor
				height="100%"
				language={currentFile ? getLanguage(currentFile.name) : 'javascript'}
				value={value}
				options={options}
				onChange={handleEditorChange}
			/>
		</div>
	);
}