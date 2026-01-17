import React from 'react';
import Message from './Message';
import './MessageList.css';

const MessageList = ({ messages = [], currentUserId, typing }) => {
  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <React.Fragment key={message._id}>
          {shouldShowDateSeparator(message, messages[index - 1]) && (
            <div className="date-separator">
              <span>{formatDate(message.createdAt)}</span>
            </div>
          )}
          <Message 
            message={message}
            isOwn={message.sender._id === currentUserId}
          />
        </React.Fragment>
      ))}
      
      {typing && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">typing...</span>
        </div>
      )}
    </div>
  );
};

export default MessageList;