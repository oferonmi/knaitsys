import MonacoEditor from '@monaco-editor/react';

export default function Editor({ code, onChange, language }) {
	return (
		<MonacoEditor
			height="90vh"
			language={language || 'javascript'}
			theme="vs-dark"
			value={code}
			onChange={onChange}
			options={{
				minimap: { enabled: true },
				fontSize: 16,
				scrollBeyondLastLine: false,
				automaticLayout: true,
			}}
		/>
	);
}