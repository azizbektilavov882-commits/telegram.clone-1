import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FiX, FiEdit2, FiSave, FiUser, FiMail, FiAtSign } from 'react-icons/fi';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.put('/api/users/profile', formData);
      setIsEditing(false);
      // You might want to update the user context here
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || ''
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>Profile</h2>
        <button onClick={onClose} className="close-btn">
          <FiX />
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'S')}
          </div>
          <button className="avatar-edit-btn">
            <FiEdit2 />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-form">
          <div className="form-group">
            <label>
              <FiUser className="field-icon" />
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            ) : (
              <div className="field-value">{user.firstName || 'Not set'}</div>
            )}
          </div>

          <div className="form-group">
            <label>
              <FiUser className="field-icon" />
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            ) : (
              <div className="field-value">{user.lastName || 'Not set'}</div>
            )}
          </div>

          <div className="form-group">
            <label>
              <FiAtSign className="field-icon" />
              Username
            </label>
            <div className="field-value">@{user.username}</div>
          </div>

          <div className="form-group">
            <label>
              <FiMail className="field-icon" />
              Email
            </label>
            <div className="field-value">{user.email}</div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="3"
              />
            ) : (
              <div className="field-value">
                {user.bio || 'No bio added yet'}
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="save-btn"
              >
                <FiSave />
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="edit-btn"
            >
              <FiEdit2 />
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-footer">
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;