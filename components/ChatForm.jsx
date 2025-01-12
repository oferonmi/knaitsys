import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { useRef, useState } from 'react';
import { Loader2 } from "lucide-react";

const ChatForm = ({ userInput, onChangeHandler, onSubmitHandler, isLoading }) => {

	const [files, setFiles] = useState(undefined);  //useState< FileList | undefined >(undefined);
	const fileInputRef = useRef(null);  //useRef< HTMLInputElement >(null);

	const handleSubmit = (event) => {
		// event.preventDefault();
		// onSubmitHandler(event.target.prompt.value);
		onSubmitHandler(event, {experimental_attachments: files,} );

		setFiles(undefined);

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<>
			<form className="w-full flex space-x-2" onSubmit={onSubmitHandler}> 
				{/* file input */}
				{/* <input
				type="file"
				className=""
				onChange={event => {
					if (event.target.files) {
					setFiles(event.target.files);
					}
				}}
				multiple
				ref={fileInputRef}
				/> */}

				{/* Text input */}
				<input
					type="text"
					autoComplete="off"
					autoFocus={false}
					name="prompt"
					className="flex-grow block w-full rounded-full border py-1.5 text-kaito-brand-ash-green border-kaito-brand-ash-green focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6"
					placeholder="  Say something ..."
					required={true}
					value={userInput}
					onChange={onChangeHandler}
				/>
				<button
					className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-6 py-5"
					type="submit"
				>
					<div
						role="status"
						className={`${
						isLoading ? "" : "hidden"
						} flex justify-center`}
					>
						<Loader2 className="animate-spin w-5 h-5" />
						<span className="sr-only">Loading...</span>
					</div>
					<span className={isLoading ? "hidden" : ""}>
						<i className="bi bi-send-fill"></i>
					</span>
				</button>
			</form>
		</>
	);
};

export default ChatForm;
