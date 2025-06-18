"use client";

import { RetrievalChatWindow } from "@/components/RetrievalChatWindow";
import { useState } from "react";
import { withAuth } from "@/components/HOC/withAuth";

function RetrievalPage() {
	const [readyToChat, setReadyToChat] = useState(false);
	const [apiEndPoint, setApiEndPoint] = useState(
		"/api/chat/retrieval/remote_retrieval"
	);

	return (
		<main>
			<RetrievalChatWindow
				endPoint={apiEndPoint}
				setEndPoint={setApiEndPoint}
				placeholder={
					"Ask questions about content of documents uploaded."
				}
				emoji="🤖"
				titleText="Chat to your Document"
				readyToChat={readyToChat}
				setReadyToChat={setReadyToChat}
			/>
		</main>
	);
}

export default withAuth(RetrievalPage);
