"use client";

import { useCompletion } from "ai/react";
import Emoji from "../../components/Emoji";
import { Footer } from "../../components/Footer";

const Summarizer = () => {
    const {
      completion,
      input,
      stop,
      isLoading,
      handleInputChange,
      handleSubmit,
    } = useCompletion({
      api: "/api/completion",
    });

    return (
      <div className="flex flex-auto max-w-2xl pb-5 mx-auto mt-4 sm:px-4 grow">
        {completion.length == 0 && (
          <div className="mt-12 sm:mt-24 space-y-6 text-gray-500 text-base mx-8 sm:mx-4 sm:text-2xl leading-12 flex flex-col mb-12 sm:mb-24 h-screen">
            <p>
              <Emoji symbol="👋" label="waving hand" /> Hello! Paste your text
              in the text box below or upload your text file get a summary of it
              content.
            </p>
          </div>
        )}

        {completion.length > 0 && (
          <output className="flex flex-col text-sm sm:text-base text-gray-700 flex-1 gap-y-4 mt-1 gap-x-4 rounded-md bg-gray-50 py-5 px-5 pb-60 grow">
            Completion result: {completion}
          </output>
        )}

        <footer className="z-10 fixed left-0 right-0 bottom-0 bg-slate-100 border-t-2 border-b-2">
          <div className="container max-w-2xl mx-auto my-auto p-5 pt-9 pb-9">
            <form className="w-full flex flex-col" onSubmit={handleSubmit}>
              <input
                className="flex-grow block w-full rounded-md border-0 py-1.5 text-teal-900 ring-1 ring-inset ring-teal-600 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-teal-600 sm:leading-6"
                placeholder="  Paste in the text you want to summarize"
                value={input}
                onChange={handleInputChange}
              />

              <div className="flex justify-center mt-2 space-x-6">
                <button
                  className="bg-teal-600 hover:bg-teal-800 items-center font-semibold text-white rounded-md px-3 py-1.5"
                  disabled={isLoading}
                  type="submit"
                >
                  Start summary
                </button>

                <button
                  className="bg-teal-600 hover:bg-teal-800 items-center font-semibold text-white rounded-md px-3 py-1.5"
                  type="button"
                  onClick={stop}
                >
                  Stop summary
                </button>
              </div>
            </form>
          </div>
          <Footer />
        </footer>
      </div>
    );
};

export default Summarizer;
