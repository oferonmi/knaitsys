import { Footer } from '../components/Footer';
import {SendIcon } from '../components/Icons';

const ChatForm = ({ userInput, onChangeHandler, onSubmitHandler }) => {

  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmitHandler(event.target.prompt.value);
    onChangeHandler("");
    event.target.reset();
  };

  return (
    <footer className="z-10 fixed left-0 right-0 bottom-0 bg-slate-100 border-t-2 border-b-2">
      <div className="container max-w-2xl mx-auto my-auto p-5 pt-9 pb-9">
        <form className="w-full flex" onSubmit={onSubmitHandler}> 
          <input
            type="text"
            autoComplete="off"
            autoFocus
            name="prompt"
            className="flex-grow block w-full rounded-l-md border-0 py-1.5 text-kaito-brand-ash-green ring-1 ring-inset ring-kaito-brand-ash-green placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-kaito-brand-ash-green sm:leading-6"
            placeholder="  Send a message"
            required={true}
            value={userInput}
            onChange={onChangeHandler}
          />
          <button
            className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-r-md px-5 py-3"
            type="submit"
          >
            <SendIcon />
          </button>
        </form>
      </div>

      <Footer />
      
    </footer>
  );
};

export default ChatForm;
