import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const startChat = (farmer) => {
    setActiveChats(prev => {
      const exists = prev.find(chat => chat.farmerId === farmer._id);
      if (exists) return prev;
      
      return [...prev, {
        farmerId: farmer._id,
        farmerName: farmer.farmName || farmer.name,
        farmerImage: farmer.profileImage,
        messages: [],
        isOpen: true
      }];
    });
  };

  const sendMessage = (farmerId, message) => {
    setActiveChats(prev => prev.map(chat => 
      chat.farmerId === farmerId 
        ? {
            ...chat,
            messages: [...chat.messages, {
              id: Date.now(),
              text: message,
              sender: 'consumer',
              timestamp: new Date()
            }]
          }
        : chat
    ));
  };

  const closeChat = (farmerId) => {
    setActiveChats(prev => prev.filter(chat => chat.farmerId !== farmerId));
  };

  const toggleChat = (farmerId) => {
    setActiveChats(prev => prev.map(chat => 
      chat.farmerId === farmerId 
        ? { ...chat, isOpen: !chat.isOpen }
        : chat
    ));
  };

  const value = {
    activeChats,
    unreadCount,
    startChat,
    sendMessage,
    closeChat,
    toggleChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};