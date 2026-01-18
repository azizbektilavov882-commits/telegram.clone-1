import React from 'react';
import './OnlineStatus.css';

const OnlineStatus = ({ status, lastSeen, size = 'small' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#4CAF50';
      case 'away':
        return '#FF9800';
      case 'busy':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        if (lastSeen) {
          const now = new Date();
          const lastSeenDate = new Date(lastSeen);
          const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
          
          if (diffInMinutes < 1) {
            return 'Just now';
          } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
          } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
          } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days}d ago`;
          }
        }
        return 'Offline';
    }
  };

  return (
    <div className={`online-status ${size}`}>
      <div 
        className="status-dot"
        style={{ backgroundColor: getStatusColor() }}
      />
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};

export default OnlineStatus;