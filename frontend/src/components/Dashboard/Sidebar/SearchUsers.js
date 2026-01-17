import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiSearch } from 'react-icons/fi';
import './SearchUsers.css';

const SearchUsers = ({ onUserSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/users/search?q=${query}`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      searchUsers();
    } else {
      setUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleUserSelect = async (user) => {
    try {
      const response = await axios.post('/api/chat/with/' + user._id);
      onUserSelect(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Error creating chat. Please try again.');
    }
  };

  return (
    <div className="search-users">
      <div className="search-header">
        <h3>New Chat</h3>
        <button onClick={onClose} className="close-btn">
          <FiX />
        </button>
      </div>
      
      <div className="search-input-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="search-results">
        {loading && <div className="search-loading">Searching...</div>}
        
        {users.map(user => (
          <div 
            key={user._id} 
            className="user-item"
            onClick={() => handleUserSelect(user)}
          >
            <div className="user-avatar">
              {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'S')}
            </div>
            <div className="user-details">
              <div className="user-name">
                {user.firstName || 'User'} {user.lastName || 'Name'}
              </div>
              <div className="user-username">@{user.username}</div>
            </div>
            {user.isOnline && <div className="online-indicator"></div>}
          </div>
        ))}
        
        {query && !loading && users.length === 0 && (
          <div className="no-results">No users found</div>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;