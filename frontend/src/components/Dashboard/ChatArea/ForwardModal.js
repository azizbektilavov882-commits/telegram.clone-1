import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiSend } from 'react-icons/fi';
import axios from 'axios';
import './ForwardModal.css';

const ForwardModal = ({ message, onClose, onForward }) => {
  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    const chatName = chat.isGroup 
      ? chat.groupName 
      : chat.participants.find(p => p._id !== message.sender._id)?.firstName || 'Unknown';
    
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleChatSelect = (chatId) => {
    setSelectedChats(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleForward = async () => {
    if (selectedChats.length === 0) return;

    setLoading(true);
    try {
      await onForward(message._id, selectedChats);
      onClose();
    } catch (error) {
      console.error('Error forwarding message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forward-modal-overlay">
      <div className="forward-modal">
        <div className="forward-modal-header">
          <h3>Forward Message</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="forward-modal-body">
          <div className="search-section">
            <div className="search-input-wrapper">
              <FiSearch />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="chats-list">
            {filteredChats.map(chat => {
              const chatName = chat.isGroup 
                ? chat.groupName 
                : chat.participants.find(p => p._id !== message.sender._id)?.firstName || 'Unknown';
              
              const isSelected = selectedChats.includes(chat._id);

              return (
                <div 
                  key={chat._id}
                  className={`chat-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleChatSelect(chat._id)}
                >
                  <div className="chat-avatar">
                    {chatName[0]?.toUpperCase()}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{chatName}</div>
                    <div className="chat-type">
                      {chat.isGroup ? 'Group' : 'Private'}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="forward-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="forward-btn"
            onClick={handleForward}
            disabled={selectedChats.length === 0 || loading}
          >
            <FiSend />
            {loading ? 'Forwarding...' : `Forward to ${selectedChats.length}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;