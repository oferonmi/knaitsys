import { useState } from 'react';
import Editor from '../components/Editor';
import styles from '../styles/Ide.module.css';

export default function IdePage() {
	const [code, setCode] = useState('// Start coding here\n');
	const [language, setLanguage] = useState('javascript');
	const [files, setFiles] = useState([{ name: 'index.js', content: code }]);
	const [currentFile, setCurrentFile] = useState('index.js');

	const handleCodeChange = (newCode) => {
		setCode(newCode);
		setFiles((prev) =>
			prev.map((file) =>
				file.name === currentFile ? { ...file, content: newCode } : file
			)
		);
	};

	const handleFileChange = (fileName) => {
		const file = files.find((f) => f.name === fileName);
		setCurrentFile(fileName);
		setCode(file.content);
	};

	const addNewFile = () => {
		const newFileName = `file${files.length + 1}.js`;
		setFiles([...files, { name: newFileName, content: '' }]);
		setCurrentFile(newFileName);
		setCode('');
	};

	return (
		<div className={styles.container}>
			<div className={styles.sidebar}>
				<h2>Files</h2>
				<button onClick={addNewFile}>New File</button>
				<ul>
				{files.map((file) => (
					<li
					key={file.name}
					onClick={() => handleFileChange(file.name)}
					className={file.name === currentFile ? styles.active : ''}
					>
					{file.name}
					</li>
				))}
				</ul>
			</div>
			<div className={styles.editor}>
				<Editor code={code} onChange={handleCodeChange} language={language} />
			</div>
		</div>
	);
}