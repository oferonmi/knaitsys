import { ChatWindow } from "@/components/ChatWindow";
import { Footer } from "@/components/Footer";

export default function AgentsPage() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d00] w-full max-h-[85%] overflow-hidden text-black">
      <h1 className="text-3xl md:text-4xl mb-4">
        Explore your document by Chatting to it.
      </h1>
      <p>
        Paste the a body of text in the textarea below and click upload or, upload the PDF of a document and click embed. Then try asking any question about the content of the uploaded text/document.
      </p>
    </div>
  );
  return (
    <>
      <ChatWindow
        endpoint="api/rag"
        emptyStateComponent={InfoCard}
        showIngestForm={true}
        placeholder={'Ask questions about the content of the document you\'ve just uploaded.'}
        emoji="🥸"
        titleText="Chat to your Document"
      ></ChatWindow>
      {/* <Footer /> */}
    </>
  );
}
