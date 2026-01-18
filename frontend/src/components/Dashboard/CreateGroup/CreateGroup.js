import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import './CreateGroup.css';

const CreateGroup = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      const response = await axios.get(`/api/users/search?q=${searchQuery}`);
      // Filter out current user and already selected users
      const filteredResults = response.data.filter(u => 
        u._id !== user._id && !selectedUsers.find(selected => selected._id === u._id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserSelect = (selectedUser) => {
    setSelectedUsers(prev => [...prev, selectedUser]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      alert('Grup nomi va kamida 1 ta a\'zo kerak!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/chat/group', {
        groupName: groupName.trim(),
        participants: selectedUsers.map(u => u._id)
      });

      onGroupCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Grup yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-modal">
      <div className="create-group-content">
        <div className="create-group-header">
          <h3>Yangi Grup Yaratish</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="create-group-body">
          <div className="group-name-section">
            <label>Grup Nomi</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Grup nomini kiriting..."
              maxLength={50}
            />
          </div>

          <div className="selected-users">
            <label>Tanlangan A'zolar ({selectedUsers.length})</label>
            <div className="selected-users-list">
              {selectedUsers.map(user => (
                <div key={user._id} className="selected-user">
                  <div className="user-avatar">
                    {user.firstName?.[0] || user.username[0]}
                  </div>
                  <span>{user.firstName} {user.lastName}</span>
                  <button 
                    className="remove-user-btn"
                    onClick={() => handleUserRemove(user._id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="user-search-section">
            <label>A'zo Qo'shish</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Foydalanuvchi qidirish..."
            />
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div 
                    key={user._id} 
                    className="search-result-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">
                      {user.firstName?.[0] || user.username[0]}
                    </div>
                    <div className="user-info">
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="create-group-footer">
          <button className="cancel-btn" onClick={onClose}>
            Bekor qilish
          </button>
          <button 
            className="create-btn" 
            onClick={handleCreateGroup}
            disabled={loading || !groupName.trim() || selectedUsers.length < 1}
          >
            {loading ? 'Yaratilmoqda...' : 'Grup Yaratish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;