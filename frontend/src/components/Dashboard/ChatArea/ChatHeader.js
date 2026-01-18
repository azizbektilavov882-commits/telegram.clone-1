import React from 'react';
import { FiPhone, FiVideo, FiMoreVertical } from 'react-icons/fi';
import OnlineStatus from '../OnlineStatus/OnlineStatus';
import ThemeSelector from '../ThemeSelector/ThemeSelector';
import './ChatHeader.css';

const ChatHeader = ({ chatInfo, theme, onThemeChange }) => {
  return (
    <div className="chat-header">
      <div className="chat-info">
        <div className="chat-avatar">
          <div className="avatar-with-status">
            {chatInfo.avatar}
            {!chatInfo.isGroup && (
              <div 
                className="status-dot"
                style={{ 
                  backgroundColor: chatInfo.onlineStatus === 'online' ? '#4CAF50' : '#9E9E9E'
                }}
              />
            )}
          </div>
        </div>
        <div className="chat-details">
          <h3>{chatInfo.name}</h3>
          {!chatInfo.isGroup && (
            <OnlineStatus 
              status={chatInfo.onlineStatus}
              lastSeen={chatInfo.lastSeen}
              size="small"
            />
          )}
        </div>
      </div>
      
      <div className="chat-actions">
        <ThemeSelector 
          currentTheme={theme}
          onThemeChange={onThemeChange}
        />
        <button className="action-btn" title="Voice call">
          <FiPhone />
        </button>
        <button className="action-btn" title="Video call">
          <FiVideo />
        </button>
        <button className="action-btn" title="More options">
          <FiMoreVertical />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;