import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import axios from 'axios';
import './ChatArea.css';

const ChatArea = ({ chat, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chat) {
      fetchMessages();
      markMessagesAsRead();
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
      
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('userTyping', handleUserTyping);
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

  const handleUserTyping = (data) => {
    if (data.userId !== user._id) {
      setTyping(data.isTyping);
      if (data.isTyping) {
        setTimeout(() => setTyping(false), 3000);
      }
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
          recipientId: otherParticipant._id
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
        isTyping
      });
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
      isOnline: otherParticipant?.isOnline || false
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
    <div className="chat-area">
      <ChatHeader chatInfo={getChatInfo()} />
      
      <MessageList 
        messages={messages}
        currentUserId={user._id}
        typing={typing}
      />
      
      <div ref={messagesEndRef} />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        chatId={chat._id}
      />
    </div>
  );
};

export default ChatArea;