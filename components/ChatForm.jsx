import { Footer } from '@/components/Footer';
import {SendIcon } from '@/components/Icons';

const ChatForm = ({ userInput, onChangeHandler, onSubmitHandler }) => {

  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmitHandler(event.target.prompt.value);
    onChangeHandler("");
    event.target.reset();
  };

  return (
    <>
      <form className="w-full flex" onSubmit={onSubmitHandler}> 
        <input
          type="text"
          autoComplete="off"
          autoFocus
          name="prompt"
          className="flex-grow block w-full rounded-l-md border py-1.5 text-kaito-brand-ash-green border-kaito-brand-ash-green focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6"
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
    </>
  );
};

export default ChatForm;
