import React from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import './ChatList.css';

const ChatList = ({ chats = [], activeChat, onChatSelect, currentUserId }) => {
  const { onlineUsers } = useSocket();

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getChatInfo = (chat) => {
    if (chat.isGroup) {
      return {
        name: chat.groupName,
        avatar: chat.groupAvatar || (chat.groupName?.[0] || 'G'),
        isOnline: false
      };
    }

    const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
    return {
      name: `${otherParticipant?.firstName || 'User'} ${otherParticipant?.lastName || 'Name'}`,
      avatar: `${(otherParticipant?.firstName?.[0] || 'U')}${(otherParticipant?.lastName?.[0] || 'S')}`,
      isOnline: onlineUsers.has(otherParticipant?._id)
    };
  };

  return (
    <div className="chat-list">
      {chats.map(chat => {
        const chatInfo = getChatInfo(chat);
        const isActive = activeChat?._id === chat._id;
        
        return (
          <div
            key={chat._id}
            className={`chat-item ${isActive ? 'active' : ''}`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="chat-avatar-container">
              <div className="chat-avatar">
                {chatInfo.avatar}
              </div>
              {chatInfo.isOnline && <div className="online-dot"></div>}
            </div>
            
            <div className="chat-content">
              <div className="chat-header">
                <div className="chat-name">{chatInfo.name}</div>
                {chat.lastMessage && (
                  <div className="chat-time">
                    {formatTime(chat.lastMessage.createdAt)}
                  </div>
                )}
              </div>
              
              {chat.lastMessage && (
                <div className="chat-last-message">
                  {chat.lastMessage.sender._id === currentUserId ? 'You: ' : ''}
                  {chat.lastMessage.text}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {chats.length === 0 && (
        <div className="no-chats">
          <p>No chats yet</p>
          <span>Start a new conversation</span>
        </div>
      )}
    </div>
  );
};

export default ChatList;