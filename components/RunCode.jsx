import { useState } from 'react';

export default function RunCode({ code, language }) {
	const [output, setOutput] = useState('');

	const runCode = async () => {
		try {
			const response = await fetch('https://emkc.org/api/v2/piston/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language,
					version: '*',
					files: [{ content: code }],
				}),
			});
			const result = await response.json();
			setOutput(result.run.output);
		} catch (error) {
			setOutput('Error running code');
		}
	};

	return (
		<div>
			<button onClick={runCode}>Run Code</button>
			<pre>{output}</pre>
		</div>
	);
}