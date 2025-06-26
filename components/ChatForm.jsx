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
	};

	return (
		<div className="w-full max-w-full rounded-lg bg-white dark:bg-gray-900 relative">
			<div className="absolute right-16 bottom-5 z-10">
				<LlmSelector 
					llmApiRoute={llmApiEndpoint} 
					handleLlmApiChange={onLlmApiEndpointChange}
				/>
			</div>
			
			<form className="relative w-full" onSubmit={handleSubmit}> 
				<textarea
					type="text"
					autoComplete="off"
					autoFocus={false}
					name="prompt"
					className="w-full h-full min-h-[100px] bg-white dark:bg-gray-900 rounded-lg shadow-none border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent resize-none text-kaito-brand-ash-green dark:text-kaito-brand-ash-green/80 placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:leading-6"
					placeholder={TEXTAREA_CONFIG.placeholder}
					required
					value={userInput}
					onChange={onChangeHandler}
					style={{ minHeight: TEXTAREA_CONFIG.minHeight }}
				/>
				<SubmitButton isLoading={isLoading} />
			</form>
		</div>
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
