import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import SearchUsers from './SearchUsers';
import ChatList from './ChatList';
import { FiSearch, FiMenu, FiSettings, FiLogOut, FiEdit3 } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ chats = [], activeChat, onChatSelect, onNewChat, onShowProfile }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const { user, logout } = useAuth();

  const filteredChats = Array.isArray(chats) ? chats.filter(chat => {
    if (!searchQuery) return true;
    
    const otherParticipant = chat.participants.find(p => p._id !== user._id);
    const chatName = chat.isGroup ? chat.groupName : 
      `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;
    
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="user-avatar">
            {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'S')}
          </div>
          <div className="user-info">
            <h3>{user.firstName || 'User'} {user.lastName || 'Name'}</h3>
            <span>@{user.username}</span>
          </div>
        </div>
        
        <div className="sidebar-actions">
          <button 
            className="action-btn"
            onClick={() => setShowNewChat(true)}
            title="New Chat"
          >
            <FiEdit3 />
          </button>
          <button 
            className="action-btn"
            onClick={() => setShowSearch(!showSearch)}
            title="Search"
          >
            <FiSearch />
          </button>
          <div className="menu-container">
            <button 
              className="action-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Menu"
            >
              <FiMenu />
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <button onClick={onShowProfile}>
                  <FiSettings /> Profile
                </button>
                <button onClick={logout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <SearchUsers 
          onUserSelect={onNewChat}
          onClose={() => setShowSearch(false)}
        />
      )}

      {showNewChat && (
        <SearchUsers 
          onUserSelect={(chat) => {
            onNewChat(chat);
            setShowNewChat(false);
          }}
          onClose={() => setShowNewChat(false)}
        />
      )}

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ChatList 
        chats={filteredChats}
        activeChat={activeChat}
        onChatSelect={onChatSelect}
        currentUserId={user._id}
      />
    </div>
  );
};

export default Sidebar;