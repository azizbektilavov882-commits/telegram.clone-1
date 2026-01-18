import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ForwardModal from './ForwardModal';
import TypingIndicator from './TypingIndicator';
import ThemeSelector from '../ThemeSelector/ThemeSelector';
import axios from 'axios';
import './ChatArea.css';

const ChatArea = ({ chat, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [chatTheme, setChatTheme] = useState('default');
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chat) {
      fetchMessages();
      markMessagesAsRead();
      setChatTheme(chat.theme || 'default');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chat && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && msg.sender._id !== user._id
      );
      if (unreadMessages.length > 0) {
        markMessagesAsRead();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('userTyping', handleUserTyping);
      socket.on('messageReactionUpdate', handleReactionUpdate);
      socket.on('messagePinUpdate', handlePinUpdate);
      socket.on('chatThemeUpdate', handleThemeUpdate);
      
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('userTyping', handleUserTyping);
        socket.off('messageReactionUpdate', handleReactionUpdate);
        socket.off('messagePinUpdate', handlePinUpdate);
        socket.off('chatThemeUpdate', handleThemeUpdate);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, chat]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/chat/${chat._id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (messageData) => {
    if (messageData.chatId === chat._id) {
      setMessages(prev => [...prev, messageData]);
      // Mark as read if message is from other user
      if (messageData.sender._id !== user._id) {
        markMessageAsRead(messageData._id);
      }
    }
  };

  const handleUserTyping = (data) => {
    if (data.userId !== user._id && data.chatId === chat._id) {
      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add user to typing list if not already there
          const existingUser = prev.find(u => u._id === data.userId);
          if (!existingUser) {
            // You might need to fetch user info here
            return [...prev, { _id: data.userId, firstName: 'User', username: 'user' }];
          }
          return prev;
        } else {
          // Remove user from typing list
          return prev.filter(u => u._id !== data.userId);
        }
      });

      // Auto-remove typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u._id !== data.userId));
        }, 3000);
      }
    }
  };

  const handleReactionUpdate = (data) => {
    if (data.chatId === chat._id) {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    }
  };

  const handlePinUpdate = (data) => {
    if (data.chatId === chat._id) {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, isPinned: data.isPinned }
          : msg
      ));
    }
  };

  const handleThemeUpdate = (data) => {
    if (data.chatId === chat._id) {
      setChatTheme(data.theme);
    }
  };

  const markMessagesAsRead = async () => {
    if (!chat) return;
    try {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && msg.sender._id !== user._id
      );
      for (const msg of unreadMessages) {
        await markMessageAsRead(msg._id);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await axios.put(`/api/chat/${chat._id}/messages/${messageId}/read`);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      // Emit read receipt via socket
      if (socket) {
        socket.emit('messageRead', { chatId: chat._id, messageId });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSendMessage = async (text, messageType = 'text') => {
    try {
      const response = await axios.post(`/api/chat/${chat._id}/messages`, {
        text,
        messageType
      });

      const newMessage = response.data;
      setMessages(prev => [...prev, newMessage]);
      onMessageSent(newMessage);

      // Emit socket event
      if (socket) {
        const otherParticipant = chat.participants.find(p => p._id !== user._id);
        socket.emit('sendMessage', {
          ...newMessage,
          chatId: chat._id,
          recipientId: otherParticipant._id,
          isGroup: chat.isGroup
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping) => {
    if (socket) {
      const otherParticipant = chat.participants.find(p => p._id !== user._id);
      socket.emit('typing', {
        recipientId: otherParticipant._id,
        chatId: chat._id,
        isTyping,
        isGroup: chat.isGroup
      });
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await axios.post(`/api/chat/${chat._id}/messages/${messageId}/reactions`, {
        emoji
      });

      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions: response.data }
          : msg
      ));

      // Emit socket event
      if (socket) {
        socket.emit('messageReaction', {
          chatId: chat._id,
          messageId,
          reactions: response.data
        });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handlePin = async (messageId) => {
    try {
      const response = await axios.put(`/api/chat/${chat._id}/messages/${messageId}/pin`);

      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, isPinned: response.data.isPinned }
          : msg
      ));

      // Emit socket event
      if (socket) {
        socket.emit('messagePin', {
          chatId: chat._id,
          messageId,
          isPinned: response.data.isPinned
        });
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleForward = (message) => {
    setMessageToForward(message);
    setShowForwardModal(true);
  };

  const handleForwardConfirm = async (messageId, targetChatIds) => {
    try {
      await axios.post(`/api/chat/${chat._id}/messages/${messageId}/forward`, {
        targetChatIds
      });

      // Emit socket event
      if (socket) {
        const message = messages.find(m => m._id === messageId);
        socket.emit('messageForward', {
          message,
          targetChatIds
        });
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
  };

  const handleThemeChange = async (theme) => {
    try {
      await axios.put(`/api/chat/${chat._id}/theme`, { theme });
      setChatTheme(theme);

      // Emit socket event
      if (socket) {
        socket.emit('themeUpdate', {
          chatId: chat._id,
          theme
        });
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChatInfo = () => {
    if (chat.isGroup) {
      return {
        name: chat.groupName,
        avatar: chat.groupName[0],
        isOnline: false
      };
    }

    const otherParticipant = chat.participants.find(p => p._id !== user._id);
    return {
      name: `${otherParticipant?.firstName} ${otherParticipant?.lastName}`,
      avatar: `${otherParticipant?.firstName[0]}${otherParticipant?.lastName[0]}`,
      isOnline: otherParticipant?.isOnline || false,
      onlineStatus: otherParticipant?.onlineStatus || 'offline',
      lastSeen: otherParticipant?.lastSeen
    };
  };

  if (loading) {
    return (
      <div className="chat-area">
        <div className="chat-loading">Loading messages...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-area">
        <div className="chat-loading">Select a chat to start messaging</div>
      </div>
    );
  }

  return (
    <div className={`chat-area theme-${chatTheme}`} data-theme={chatTheme}>
      <ChatHeader 
        chatInfo={getChatInfo()} 
        theme={chatTheme}
        onThemeChange={handleThemeChange}
      />
      
      <MessageList 
        messages={messages}
        currentUserId={user._id}
        currentUser={user}
        onReaction={handleReaction}
        onPin={handlePin}
        onForward={handleForward}
      />

      {typingUsers.length > 0 && (
        <TypingIndicator typingUsers={typingUsers} />
      )}
      
      <div ref={messagesEndRef} />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        chatId={chat._id}
      />

      {showForwardModal && (
        <ForwardModal
          message={messageToForward}
          onClose={() => setShowForwardModal(false)}
          onForward={handleForwardConfirm}
        />
      )}
    </div>
  );
};

export default ChatArea;