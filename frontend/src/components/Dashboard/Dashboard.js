import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiUsers, FiSettings, FiSun, FiMoon } from 'react-icons/fi';
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
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchChats();
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
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

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Top Navigation Bar */}
      <div className="dashboard-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
          >
            <FiMessageCircle />
          </button>
          <h1 className="app-title">Telegram Clone</h1>
        </div>
        
        <div className="header-right">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button 
            className="profile-btn"
            onClick={() => setShowProfile(true)}
            title="Profile Settings"
          >
            <FiSettings />
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        <Sidebar 
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onShowProfile={() => setShowProfile(true)}
          collapsed={sidebarCollapsed}
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
              <div className="welcome-container">
                <div className="welcome-icon">
                  <FiMessageCircle size={80} />
                </div>
                <div className="welcome-content">
                  <h2>Welcome to Telegram Clone</h2>
                  <p>Select a chat from the sidebar to start messaging</p>
                  <div className="welcome-features">
                    <div className="feature">
                      <FiMessageCircle size={20} />
                      <span>Send messages with reactions</span>
                    </div>
                    <div className="feature">
                      <FiUsers size={20} />
                      <span>Create and manage groups</span>
                    </div>
                    <div className="feature">
                      <FiSettings size={20} />
                      <span>Customize your experience</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Animated Background */}
              <div className="animated-bg">
                <div className="floating-bubble bubble-1"></div>
                <div className="floating-bubble bubble-2"></div>
                <div className="floating-bubble bubble-3"></div>
                <div className="floating-bubble bubble-4"></div>
                <div className="floating-bubble bubble-5"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;