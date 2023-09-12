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
              {/* <input
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
              </div> */}

              <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 ">
                {/* dark:bg-gray-700 dark:border-gray-600 */}
                <div className="px-4 py-2 bg-white rounded-t-lg ">
                  {/* dark:bg-gray-800 */}
                  {/* <label htmlFor="comment" className="sr-only">
                    Your comment
                  </label> */}
                  <textarea
                    id="comment"
                    rows="4"
                    className="w-full px-0 text-sm text-teal-900 bg-white border-0  focus:ring-0 focus:ring-inset focus:ring-teal-600"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Paste or upload the file of the text you want to summarize..."
                    required
                  ></textarea>
                  {/* dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 */}
                </div>

                <div className="flex items-center justify-between px-3 py-2 border-t ">
                  {/* dark:border-gray-600 */}
                  <div className="justify-left mt-2 space-x-6">
                    <button
                      className="inline-flex items-center py-1.5 px-3 font-medium text-center text-white bg-teal-600 rounded-md focus:ring-4 focus:ring-teal-200  hover:bg-teal-800"
                      type="submit"
                      disabled={isLoading}
                    >
                      {/* dark:focus:ring-teal-900 */}
                      Start summary
                    </button>
                    <button
                      className="inline-flex bg-teal-600 hover:bg-teal-800 items-center font-medium text-white rounded-md px-3 py-1.5"
                      type="button"
                      onClick={stop}
                    >
                      Stop summary
                    </button>
                  </div>
                  <div className="flex pl-0 space-x-1 sm:pl-2">
                    <button
                      type="button"
                      className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-teal-100  "
                    >
                      {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
                      <svg
                        className="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 12 20"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"
                        />
                      </svg>
                      <span className="sr-only">Attach file</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <Footer />
        </footer>
      </div>
    );
};

export default Summarizer;
