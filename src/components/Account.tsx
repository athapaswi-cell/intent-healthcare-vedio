import React, { useState, useEffect } from 'react';
import './Account.css';

interface UserRegistrationData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  role: string;
  patientId?: string;
  registeredAt?: string;
}

interface AccountProps {
  onBack?: () => void;
}

export default function Account({ onBack }: AccountProps) {
  const [userData, setUserData] = useState<UserRegistrationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user from localStorage
    const savedUser = localStorage.getItem('patientPortalUser');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    if (currentUser) {
      // Get registration details from registeredUsers
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userDetails = registeredUsers.find(
        (u: any) => u.username === currentUser.username
      );

      if (userDetails) {
        setUserData({
          username: userDetails.username || currentUser.username,
          email: userDetails.email || currentUser.email || '',
          firstName: userDetails.firstName || '',
          lastName: userDetails.lastName || '',
          dateOfBirth: userDetails.dateOfBirth || '',
          gender: userDetails.gender || '',
          phone: userDetails.phone || '',
          role: userDetails.role || currentUser.role || '',
          patientId: userDetails.patientId || currentUser.patientId || '',
          registeredAt: userDetails.registeredAt || ''
        });
      } else {
        // If not found in registeredUsers, use current user data
        setUserData({
          username: currentUser.username || '',
          email: currentUser.email || '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          phone: '',
          role: currentUser.role || '',
          patientId: currentUser.patientId || '',
          registeredAt: ''
        });
      }
    }
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="account-header">
          {onBack && (
            <button className="account-back-button" onClick={onBack}>
              ←
            </button>
          )}
          <h1>Account</h1>
        </div>
        <div className="account-loading">
          <p>Loading account information...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="account-container">
        <div className="account-header">
          {onBack && (
            <button className="account-back-button" onClick={onBack}>
              ←
            </button>
          )}
          <h1>Account</h1>
        </div>
        <div className="account-empty">
          <p>No account information found. Please register or login.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-header">
        {onBack && (
          <button className="account-back-button" onClick={onBack}>
            ←
          </button>
        )}
        <h1>Account Information</h1>
      </div>

      <div className="account-content">
        {/* Personal Information Section */}
        <div className="account-section">
          <h2 className="account-section-title">Personal Information</h2>
          <div className="account-details-grid">
            <div className="account-detail-item">
              <label className="account-detail-label">First Name</label>
              <div className="account-detail-value">
                {userData.firstName || 'Not provided'}
              </div>
            </div>
            <div className="account-detail-item">
              <label className="account-detail-label">Last Name</label>
              <div className="account-detail-value">
                {userData.lastName || 'Not provided'}
              </div>
            </div>
            <div className="account-detail-item">
              <label className="account-detail-label">Full Name</label>
              <div className="account-detail-value">
                {`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Not provided'}
              </div>
            </div>
            <div className="account-detail-item">
              <label className="account-detail-label">Date of Birth</label>
              <div className="account-detail-value">
                {formatDate(userData.dateOfBirth)}
              </div>
            </div>
            <div className="account-detail-item">
              <label className="account-detail-label">Gender</label>
              <div className="account-detail-value">
                {userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not provided'}
              </div>
            </div>
            <div className="account-detail-item">
              <label className="account-detail-label">Phone Number</label>
              <div className="account-detail-value">
                {userData.phone || 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Account Credentials Section */}
        <div className="account-section">
          <h2 className="account-section-title">Account Credentials</h2>
          <div className="account-details-grid">
            <div className="account-detail-item">
              <label className="account-detail-label">Username</label>
              <div className="account-detail-value">
                {userData.username}
              </div>
            </div>
            <div className="account-detail-item">
              <label className="account-detail-label">Email Address</label>
              <div className="account-detail-value">
                {userData.email || 'Not provided'}
              </div>
            </div>
            <div className="account-detail-item">
              <label className="account-detail-label">Role</label>
              <div className="account-detail-value">
                {userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1).replace('-', ' ') : 'Not provided'}
              </div>
            </div>
            {userData.patientId && (
              <div className="account-detail-item">
                <label className="account-detail-label">Patient ID</label>
                <div className="account-detail-value">
                  {userData.patientId}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Registration Information Section */}
        {userData.registeredAt && (
          <div className="account-section">
            <h2 className="account-section-title">Registration Information</h2>
            <div className="account-details-grid">
              <div className="account-detail-item">
                <label className="account-detail-label">Registration Date</label>
                <div className="account-detail-value">
                  {formatDateTime(userData.registeredAt)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

