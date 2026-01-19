import React, { useState } from 'react';
import { FiCheck, FiCheckCircle, FiDownload, FiMoreVertical, FiBookmark, FiShare2, FiSmile } from 'react-icons/fi';
import './Message.css';

const Message = ({ message, isOwn, onEdit, onDelete, onReaction, onPin, onForward, currentUser }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReaction = (emoji) => {
    if (onReaction) {
      onReaction(message._id, emoji);
    }
    setShowReactions(false);
  };

  const handlePin = () => {
    if (onPin) {
      onPin(message._id);
    }
    setShowActions(false);
  };

  const handleForward = () => {
    if (onForward) {
      onForward(message);
    }
    setShowActions(false);
  };

  if (!message || !message.sender) {
    return null;
  }

  const isFile = message.messageType === 'file' || message.fileUrl;
  const isImage = message.messageType === 'image' || (isFile && /\.(jpg|jpeg|png|gif)$/i.test(message.fileName || ''));
  const reactions = message.reactions || [];
  const hasReactions = reactions.length > 0;

  return (
    <div className={`message ${isOwn ? 'own' : 'other'} ${message.isPinned ? 'pinned' : ''}`}>
      {!isOwn && (
        <div className="message-avatar">
          {(message.sender.firstName?.[0] || 'U')}{(message.sender.lastName?.[0] || 'S')}
        </div>
      )}
      
      <div className="message-content">
        {!isOwn && (
          <div className="message-sender">
            {message.sender.firstName || 'User'} {message.sender.lastName || 'Name'}
          </div>
        )}

        {/* Forwarded Message Indicator */}
        {message.forwardedFrom && (
          <div className="forwarded-indicator">
            <FiShare2 size={12} />
            <span>Forwarded</span>
          </div>
        )}

        {/* Pinned Message Indicator */}
        {message.isPinned && (
          <div className="pinned-indicator">
            <FiBookmark size={12} />
            <span>Pinned</span>
          </div>
        )}
        
        <div className="message-bubble">
          {isFile ? (
            <div className="message-file">
              {isImage ? (
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName || 'Image'} 
                  className="message-image"
                  onClick={() => window.open(message.fileUrl, '_blank')}
                />
              ) : (
                <a 
                  href={message.fileUrl} 
                  download={message.fileName}
                  className="message-file-link"
                >
                  <FiDownload />
                  <div className="file-info">
                    <span className="file-name">{message.fileName || 'File'}</span>
                    {message.fileSize && (
                      <span className="file-size">{formatFileSize(message.fileSize)}</span>
                    )}
                  </div>
                </a>
              )}
            </div>
          ) : null}
          
          {message.text && (
            <div className="message-text">
              {message.text}
              {message.edited && (
                <span className="edited-indicator"> (edited)</span>
              )}
            </div>
          )}

          {/* Message Reactions */}
          {hasReactions && (
            <div className="message-reactions">
              {reactions.map((reaction, index) => (
                <div 
                  key={index} 
                  className={`reaction ${reaction.users.includes(currentUser?._id) ? 'own-reaction' : ''}`}
                  onClick={() => handleReaction(reaction.emoji)}
                >
                  <span className="reaction-emoji">{reaction.emoji}</span>
                  <span className="reaction-count">{reaction.count}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="message-meta">
            <span className="message-time">
              {formatTime(message.createdAt || message.timestamp)}
            </span>
            {isOwn && (
              <div className="message-status">
                {message.isRead ? (
                  <FiCheckCircle className="read" />
                ) : (
                  <FiCheck className="sent" />
                )}
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="message-actions">
            <button 
              className="action-btn"
              onClick={() => setShowReactions(!showReactions)}
            >
              <FiSmile size={16} />
            </button>
            <button 
              className="action-btn"
              onClick={() => setShowActions(!showActions)}
            >
              <FiMoreVertical size={16} />
            </button>

            {/* Reaction Picker */}
            {showReactions && (
              <div className="reaction-picker">
                {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                  <button
                    key={emoji}
                    className="reaction-option"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Actions Menu */}
            {showActions && (
              <div className="actions-menu">
                <button onClick={handlePin}>
                  <FiBookmark size={14} />
                  {message.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button onClick={handleForward}>
                  <FiShare2 size={14} />
                  Forward
                </button>
                {isOwn && (
                  <>
                    <button onClick={() => onEdit && onEdit(message)}>
                      Edit
                    </button>
                    <button onClick={() => onDelete && onDelete(message._id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;