import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const ChatWindow = ({ chat }) => {
  const [message, setMessage] = useState('');
  const { sendMessage, closeChat, toggleChat } = useChat();

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(chat.farmerId, message.trim());
      setMessage('');
    }
  };

  if (!chat.isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border">
      {/* Header */}
      <div className="bg-green-500 text-white p-3 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span>👨‍🌾</span>
          <span className="font-semibold">{chat.farmerName}</span>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => toggleChat(chat.farmerId)} className="text-white">
            −
          </button>
          <button onClick={() => closeChat(chat.farmerId)} className="text-white">
            ×
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-3 space-y-2">
        {chat.messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">
            Start a conversation with {chat.farmerName}
          </div>
        ) : (
          chat.messages.map(msg => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg max-w-[80%] ${
                msg.sender === 'consumer'
                  ? 'bg-green-100 ml-auto'
                  : 'bg-gray-100'
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;