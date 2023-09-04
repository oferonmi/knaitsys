import { Footer } from '../components/Footer';

const ChatForm = ({ userInput, onChangeHandler, onSubmitHandler }) => {

  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmitHandler(event.target.prompt.value);
    onChangeHandler("");
    event.target.reset();
  };

  const chatIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send-fill" viewBox="0 0 16 16">
  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
  </svg>

  return (
    <footer className="z-10 fixed left-0 right-0 bottom-0 bg-slate-100 border-t-2 border-b-2">
      <div className="container max-w-2xl mx-auto my-auto p-5 pt-9 pb-9">
        <form className="w-full flex" onSubmit={onSubmitHandler}> 
        {/* {handleSubmit} */}
          <input
            type="text"
            autoComplete="off"
            autoFocus
            name="prompt"
            className="flex-grow block w-full rounded-l-md border-0 py-1.5 text-teal-900 ring-1 ring-inset ring-teal-600 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-teal-600 sm:leading-6"
            placeholder="  Send a message"
            required={true}
            value={userInput}
            onChange={onChangeHandler} //{(e) => onChangeHandler(e.target.value)}
          />
          <button
            className="bg-teal-600 hover:bg-teal-800 items-center font-semibold text-white rounded-r-md px-5 py-3"
            type="submit"
          >
            {chatIcon}
          </button>
        </form>
      </div>

      <Footer />
      
    </footer>
  );
};

export default ChatForm;
