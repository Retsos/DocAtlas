const TypingIndicator = () => {
  return (
    <div className="flex gap-1 px-3 py-2 bg-gray-100 rounded-xl w-fit">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
    </div>
  );
};

export default TypingIndicator;
