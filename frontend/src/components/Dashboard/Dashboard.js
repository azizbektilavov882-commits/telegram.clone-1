import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import ChatArea from './ChatArea/ChatArea';
import UserProfile from './UserProfile/UserProfile';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat');
      setChats(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    setShowProfile(false);
  };

  const handleNewChat = (newChat) => {
    setChats(prev => {
      const exists = prev.find(chat => chat._id === newChat._id);
      if (exists) return prev;
      return [newChat, ...prev];
    });
    setActiveChat(newChat);
  };

  const updateChatLastMessage = (chatId, message) => {
    setChats(prev => prev.map(chat => 
      chat._id === chatId 
        ? { ...chat, lastMessage: message, lastActivity: new Date() }
        : chat
    ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)));
  };

  if (loading) {
    return <div className="dashboard-loading">Loading chats...</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar 
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onShowProfile={() => setShowProfile(true)}
      />
      
      <div className="dashboard-main">
        {showProfile ? (
          <UserProfile onClose={() => setShowProfile(false)} />
        ) : activeChat ? (
          <ChatArea 
            chat={activeChat}
            onMessageSent={(message) => updateChatLastMessage(activeChat._id, message)}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <h2>Welcome to Telegram Clone</h2>
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;