import { ChatWindow } from "@/components/ChatWindow";
import { Footer } from "@/components/Footer";

export default function AgentsPage() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d00] w-full max-h-[85%] overflow-hidden text-black">
      <h1 className="text-3xl md:text-4xl mb-4">
        Explore your document by Chatting to it.
      </h1>
      <p>
        Paste the document text in the textaera below and upload or, upload the PDF of the document and embed. Then try asking any question about the documents content.
      </p>
    </div>
  );
  return (
    <>
      <ChatWindow
        endpoint="api/rag"
        emptyStateComponent={InfoCard}
        showIngestForm={true}
        placeholder={
          'I\'ve got a thing for finding the right documents! Ask, "What is a document loader?"'
        }
        emoji="🥸"
        titleText="Chat to your Document"
      ></ChatWindow>
      {/* <Footer /> */}
    </>
  );
}
