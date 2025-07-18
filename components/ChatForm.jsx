import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import LlmSelector from '@/components/LlmSelector';
import PropTypes from 'prop-types';

const TEXTAREA_CONFIG = {
	minHeight: '100px',
	placeholder: 'Got questions? Ask ...',
};

const ChatForm = ({ 
	userInput, 
	onChangeHandler, 
	onSubmitHandler,
	llmApiEndpoint,
	onLlmApiEndpointChange,
	isLoading 
}) => {
	const [files, setFiles] = useState(null);
	const fileInputRef = useRef(null);
	const textareaRef = useRef(null);

	const handleSubmit = (event) => {
		event.preventDefault(); // Prevent default form submission
		onSubmitHandler(event, {
		experimental_attachments: files,
		});
		resetForm();
	};

	const resetForm = () => {
		setFiles(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		if (textareaRef.current) {
			textareaRef.current.style.height = TEXTAREA_CONFIG.minHeight;
		}
	};

	const handleInput = (e) => {
		const ta = textareaRef.current;
		if (ta) {
			const viewportFraction = 0.4; // 40% of viewport height
			const maxHeight = Math.floor(window.innerHeight * viewportFraction);
			ta.style.height = TEXTAREA_CONFIG.minHeight;
			ta.style.maxHeight = maxHeight + 'px';
			ta.style.overflowY = 'auto';
			if (ta.scrollHeight <= maxHeight) {
				ta.style.height = ta.scrollHeight + 'px';
			} else {
				ta.style.height = maxHeight + 'px';
			}
		}
		onChangeHandler(e);
	};

	return (
		<>
			<form className="relative w-full" onSubmit={handleSubmit} >
				<textarea
					type="text"
					autoComplete="off"
					autoFocus={false}
					name="prompt"
					className="w-full h-full min-h-[100px] mb-0 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent resize-none text-kaito-brand-ash-green dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:leading-6"
					placeholder={TEXTAREA_CONFIG.placeholder}
					required
					value={userInput}
					onChange={handleInput}
					onInput={handleInput}
					ref={textareaRef}
					style={{ minHeight: TEXTAREA_CONFIG.minHeight, overflow: 'hidden', maxHeight: '40vh' }}
				/>

				<div className="absolute right-16 bottom-5 z-10">
					<LlmSelector 
						llmApiRoute={llmApiEndpoint} 
						handleLlmApiChange={onLlmApiEndpointChange}
					/>
				</div>
				<SubmitButton isLoading={isLoading} />
			</form>
		</>
	);
};

const SubmitButton = ({ isLoading }) => (
	<button
		className="absolute bottom-3 right-3 text-gray-200 dark:text-gray-100 hover:text-gray-300 dark:hover:text-gray-400 bg-kaito-brand-ash-green dark:bg-kaito-brand-ash-green/80 rounded-full px-4 py-3 transition-colors"
		type="submit"
		aria-label={isLoading ? 'Submitting...' : 'Submit'}
	>
		{isLoading ? (
			<div role="status" className="flex justify-center">
				<Loader2 className="animate-spin w-4 h-6" />
				<span className="sr-only">Loading...</span>
			</div>
		) : (
			<i className="bi bi-send-fill" />
		)}
	</button>
);

ChatForm.propTypes = {
	userInput: PropTypes.string.isRequired,
	onChangeHandler: PropTypes.func.isRequired,
	onSubmitHandler: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
};

SubmitButton.propTypes = {
	isLoading: PropTypes.bool.isRequired,
};

export default ChatForm;
