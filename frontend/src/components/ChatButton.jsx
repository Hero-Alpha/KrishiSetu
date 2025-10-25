import React from 'react';
import { useChat } from '../context/ChatContext';

const ChatButton = ({ farmer }) => {
  const { startChat } = useChat();

  return (
    <button
      onClick={() => startChat(farmer)}
      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <span>💬</span>
      <span>Chat with Farmer</span>
    </button>
  );
};

export default ChatButton;