import ChatbotWidget from "./components/chatbot/ChatbotWidget";

interface AppProps {
  uid: string;
}

function App({ uid }: AppProps) {
  return (
    <div className="docatlas-widget-wrapper"> 
      <ChatbotWidget uid={uid} />
    </div>
  );
}

export default App;