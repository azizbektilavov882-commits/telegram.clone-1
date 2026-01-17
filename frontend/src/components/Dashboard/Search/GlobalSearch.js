 import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDebounce } from '../../../hooks/useDebounce';
import axios from 'axios';
import './GlobalSearch.css';

const GlobalSearch = ({ isOpen, onClose, onChatSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    users: [],
    messages: []
  });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchGlobal();
    } else {
      setResults({ users: [], messages: [] });
    }
  }, [debouncedQuery]);

  const searchGlobal = async () => {
    setLoading(true);
    try {
      const [usersRes, messagesRes] = await Promise.all([
        axios.get(`/api/users/search?q=${debouncedQuery}`),
        axios.get(`/api/chat/search?q=${debouncedQuery}`)
      ]);

      setResults({
        users: usersRes.data,
        messages: messagesRes.data
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-container" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSearch />
            <input
              type="text"
              className="global-search-input"
              placeholder="Search users, messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button 
              onClick={onClose}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <FiX />
            </button>
          </div>
        </div>

        <div className="global-search-results">
          {loading && <div className="search-loading">Searching...</div>}

          {!loading && query && results.users.length === 0 && results.messages.length === 0 && (
            <div className="no-search-results">No results found</div>
          )}

          {results.users.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">Users</div>
              {results.users.map(user => (
                <div
                  key={user._id}
                  className="search-result-item"
                  onClick={() => {
                    onChatSelect(user);
                    onClose();
                  }}
                >
                  <div className="search-result-avatar">
                    {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'S')}
                  </div>
                  <div className="search-result-content">
                    <div className="search-result-name">
                      {user.firstName || 'User'} {user.lastName || 'Name'}
                    </div>
                    <div className="search-result-detail">
                      @{user.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.messages.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">Messages</div>
              {results.messages.map((result, idx) => (
                <div key={idx}>
                  {result.messages.map((msg, msgIdx) => (
                    <div
                      key={msgIdx}
                      className="search-result-item"
                      onClick={() => {
                        onChatSelect(result.chat);
                        onClose();
                      }}
                    >
                      <div className="search-result-avatar">
                        {result.chat.isGroup 
                          ? result.chat.groupName[0]
                          : (result.chat.participants[0].firstName?.[0] || 'U')
                        }
                      </div>
                      <div className="search-result-content">
                        <div className="search-result-name">
                          {result.chat.isGroup 
                            ? result.chat.groupName
                            : `${result.chat.participants[0].firstName || 'User'} ${result.chat.participants[0].lastName || 'Name'}`
                          }
                        </div>
                        <div className="search-result-detail">
                          {result.messages[msgIdx].text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
