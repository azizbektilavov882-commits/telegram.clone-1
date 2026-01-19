import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import SearchUsers from './SearchUsers';
import ChatList from './ChatList';
import CreateGroup from '../CreateGroup/CreateGroup';
import { FiSearch, FiMenu, FiSettings, FiLogOut, FiEdit3, FiUsers, FiChevronLeft } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ chats = [], activeChat, onChatSelect, onNewChat, onShowProfile, collapsed }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { user, logout } = useAuth();

  const filteredChats = Array.isArray(chats) ? chats.filter(chat => {
    if (!searchQuery) return true;
    
    const otherParticipant = chat.participants.find(p => p._id !== user._id);
    const chatName = chat.isGroup ? chat.groupName : 
      `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;
    
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  const handleGroupCreated = (newGroup) => {
    onNewChat(newGroup);
    setShowCreateGroup(false);
  };

  if (collapsed) {
    return (
      <div className="sidebar collapsed">
        <div className="sidebar-collapsed-content">
          <div className="user-avatar-small">
            {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'S')}
          </div>
          <div className="collapsed-actions">
            <button className="collapsed-btn" onClick={() => setShowNewChat(true)}>
              <FiEdit3 />
            </button>
            <button className="collapsed-btn" onClick={() => setShowSearch(true)}>
              <FiSearch />
            </button>
            <button className="collapsed-btn" onClick={onShowProfile}>
              <FiSettings />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="user-avatar">
            <div className="avatar-image">
              {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'S')}
            </div>
            <div className="online-indicator"></div>
          </div>
          <div className="user-info">
            <h3>{user.firstName || 'User'} {user.lastName || 'Name'}</h3>
            <span className="username">@{user.username}</span>
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
            onClick={() => setShowCreateGroup(true)}
            title="Create Group"
          >
            <FiUsers />
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
                <button onClick={() => setShowSearch(!showSearch)}>
                  <FiSearch /> Search
                </button>
                <button onClick={logout} className="logout-btn">
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="search-overlay">
          <div className="search-header">
            <button 
              className="back-btn"
              onClick={() => setShowSearch(false)}
            >
              <FiChevronLeft />
            </button>
            <h3>Search Users</h3>
          </div>
          <SearchUsers 
            onUserSelect={(chat) => {
              onNewChat(chat);
              setShowSearch(false);
            }}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {showNewChat && (
        <div className="search-overlay">
          <div className="search-header">
            <button 
              className="back-btn"
              onClick={() => setShowNewChat(false)}
            >
              <FiChevronLeft />
            </button>
            <h3>New Chat</h3>
          </div>
          <SearchUsers 
            onUserSelect={(chat) => {
              onNewChat(chat);
              setShowNewChat(false);
            }}
            onClose={() => setShowNewChat(false)}
          />
        </div>
      )}

      {showCreateGroup && (
        <CreateGroup
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      <div className="sidebar-search">
        <div className="search-input-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-content">
        <ChatList 
          chats={filteredChats}
          activeChat={activeChat}
          onChatSelect={onChatSelect}
          currentUserId={user._id}
        />
      </div>
    </div>
  );
};

export default Sidebar;