import Emoji from "./Emoji";

const EmptyThreadState = () => {
  return (
    <div className="mt-12 sm:mt-24 space-y-6 text-gray-500 text-base mx-8 sm:mx-4 sm:text-2xl leading-12 flex flex-col mb-12 sm:mb-24 h-screen">
        <p>
            <Emoji symbol="👋" label="waving hand"/> Hello! Here you have a suite of LLMs, configured to respond to your queries. Choose one of them and post your message/questions in the chat box below, and get a response, that hopefully helps with understanding.
        </p>
    </div>
  );
}

export default EmptyThreadState;
