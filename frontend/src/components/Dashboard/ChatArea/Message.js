import React from 'react';
import { FiCheck, FiCheckCircle, FiDownload, FiImage } from 'react-icons/fi';
import './Message.css';

const Message = ({ message, isOwn, onEdit, onDelete }) => {
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

  if (!message || !message.sender) {
    return null;
  }

  const isFile = message.messageType === 'file' || message.fileUrl;
  const isImage = message.messageType === 'image' || (isFile && /\.(jpg|jpeg|png|gif)$/i.test(message.fileName || ''));

  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
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
        </div>
      </div>
    </div>
  );
};

export default Message;