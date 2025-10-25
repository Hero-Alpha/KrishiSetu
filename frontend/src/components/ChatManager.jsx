import React from 'react';
import { useChat } from '../context/ChatContext';
import ChatWindow from './ChatWindow';

const ChatManager = () => {
  const { activeChats } = useChat();

  return (
    <>
      {activeChats.map(chat => (
        <ChatWindow key={chat.farmerId} chat={chat} />
      ))}
    </>
  );
};

export default ChatManager;