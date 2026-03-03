import React, { useState } from 'react';
import './DataDisplay.css';
import PatientRegister from './PatientRegister';

type UserRole = 'patient' | 'doctor' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';

interface LoginCredentials {
  username: string;
  password: string;
  role: UserRole;
}

interface PatientLoginProps {
  onLogin: (user: { username: string; role: UserRole; patientId?: string; email?: string; name?: string }) => void;
}

// Mock users for demonstration
// In production, this would call a backend authentication API
const MOCK_USERS = {
  doctors: [
    { username: 'doctor1', password: 'doctor123', role: 'doctor' as const, name: 'Dr. John Smith' },
    { username: 'doctor2', password: 'doctor123', role: 'doctor' as const, name: 'Dr. Sarah Johnson' },
    { username: 'admin', password: 'admin123', role: 'doctor' as const, name: 'Admin User' }
  ],
  patients: [
    { username: 'patient1', password: 'patient123', role: 'patient' as const, name: 'John Doe', patientId: 'PAT001' },
    { username: 'patient2', password: 'patient123', role: 'patient' as const, name: 'Jane Smith', patientId: 'PAT002' },
    { username: 'patient3', password: 'patient123', role: 'patient' as const, name: 'Bob Wilson', patientId: 'PAT003' }
  ],
  'insurance-agents': [
    { username: 'insurance1', password: 'insurance123', role: 'insurance-agent' as const, name: 'Insurance Agent 1' },
    { username: 'insurance2', password: 'insurance123', role: 'insurance-agent' as const, name: 'Insurance Agent 2' }
  ],
  pharmacies: [
    { username: 'pharmacy1', password: 'pharmacy123', role: 'pharmacy' as const, name: 'Pharmacy 1' },
    { username: 'pharmacy2', password: 'pharmacy123', role: 'pharmacy' as const, name: 'Pharmacy 2' }
  ],
  hospitals: [
    { username: 'hospital1', password: 'hospital123', role: 'hospital' as const, name: 'Hospital 1' },
    { username: 'hospital2', password: 'hospital123', role: 'hospital' as const, name: 'Hospital 2' }
  ],
  admins: [
    { username: 'admin', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
    { username: 'admin1', password: 'admin123', role: 'admin' as const, name: 'System Administrator' }
  ]
};

export default function PatientLogin({ onLogin }: PatientLoginProps) {
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // First check registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const registeredUser = registeredUsers.find(
        (u: any) => u.username === credentials.username && 
                   u.password === credentials.password &&
                   u.role === credentials.role
      );

      if (registeredUser) {
        // Login successful with registered user
        onLogin({
          username: registeredUser.username,
          role: registeredUser.role,
          patientId: registeredUser.patientId,
          email: registeredUser.email,
          name: `${registeredUser.firstName} ${registeredUser.lastName}`
        });
        setLoading(false);
        return;
      }

      // Fallback to mock users
      let userList: any[] = [];
      if (credentials.role === 'doctor') {
        userList = MOCK_USERS.doctors;
      } else if (credentials.role === 'patient') {
        userList = MOCK_USERS.patients;
      } else if (credentials.role === 'insurance-agent') {
        userList = MOCK_USERS['insurance-agents'];
      } else if (credentials.role === 'pharmacy') {
        userList = MOCK_USERS.pharmacies;
      } else if (credentials.role === 'hospital') {
        userList = MOCK_USERS.hospitals;
      } else if (credentials.role === 'admin') {
        userList = MOCK_USERS.admins;
      }
      
      const user = userList.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (user) {
        // Login successful
        onLogin({
          username: user.username,
          role: user.role,
          patientId: 'patientId' in user ? user.patientId : undefined
        });
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (username: string, password: string, role: UserRole) => {
    setCredentials({ username, password, role });
    // Auto-submit after setting credentials
    setTimeout(() => {
      let userList: any[] = [];
      if (role === 'doctor') {
        userList = MOCK_USERS.doctors;
      } else if (role === 'patient') {
        userList = MOCK_USERS.patients;
      } else if (role === 'insurance-agent') {
        userList = MOCK_USERS['insurance-agents'];
      } else if (role === 'pharmacy') {
        userList = MOCK_USERS.pharmacies;
      } else if (role === 'hospital') {
        userList = MOCK_USERS.hospitals;
      } else if (role === 'admin') {
        userList = MOCK_USERS.admins;
      }
      
      const user = userList.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin({
          username: user.username,
          role: user.role,
          patientId: 'patientId' in user ? user.patientId : undefined
        });
      }
    }, 100);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordMessage(null);
    setForgotPasswordLoading(true);

    try {
      // Check if user exists in registered users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = registeredUsers.find(
        (u: any) => (u.username === forgotPasswordUsername || u.email === forgotPasswordEmail) &&
                   u.role === credentials.role
      );

      if (user) {
        // In a real application, this would call the backend API
        // For now, we'll show a message with instructions
        setForgotPasswordMessage(
          `Password reset instructions have been sent to ${user.email || 'your registered email'}. ` +
          `Please check your email to reset your password.`
        );
        
        // Optionally call backend API here:
        // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        // await fetch(`${API_BASE_URL}/api/v1/email/send-password-reset`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     to_email: user.email,
        //     username: user.username,
        //     reset_token: generateResetToken(),
        //   })
        // });
      } else {
        setForgotPasswordMessage(
          'No account found with the provided username/email for the selected role. Please verify your information.'
        );
      }
    } catch (err) {
      setForgotPasswordMessage('An error occurred. Please try again later.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Show register form if showRegister is true
  if (showRegister) {
    return (
      <PatientRegister
        onRegister={(user) => {
          onLogin(user);
        }}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  // Show forgot password modal if showForgotPassword is true
  if (showForgotPassword) {
    return (
      <div className="login-container" style={{ minHeight: '400px', padding: '20px' }}>
        <div className="login-card">
          <h2>🔑 Forgot Password</h2>
          <p className="login-subtitle">Enter your username or email to reset your password</p>

          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="forgot-role">Login As:</label>
              <select
                id="forgot-role"
                value={credentials.role}
                onChange={(e) => setCredentials({ ...credentials, role: e.target.value as UserRole })}
                className="form-select"
              >
                <option value="patient">👤 Patient</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
                <option value="insurance-agent">🛡️ Insurance Agent</option>
                <option value="pharmacy">💊 Pharmacy</option>
                <option value="hospital">🏥 Hospital</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="forgot-username">Username or Email:</label>
              <input
                id="forgot-username"
                type="text"
                value={forgotPasswordUsername || forgotPasswordEmail}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes('@')) {
                    setForgotPasswordEmail(value);
                    setForgotPasswordUsername('');
                  } else {
                    setForgotPasswordUsername(value);
                    setForgotPasswordEmail('');
                  }
                }}
                placeholder="Enter username or email"
                className="form-input"
                required
                disabled={forgotPasswordLoading}
              />
            </div>

            {forgotPasswordMessage && (
              <div className="error-message" style={{ 
                padding: '12px', 
                background: forgotPasswordMessage.includes('sent') ? '#d1f2eb' : '#fff3cd', 
                border: forgotPasswordMessage.includes('sent') ? '1px solid #10b981' : '1px solid #ffc107', 
                borderRadius: '6px', 
                color: forgotPasswordMessage.includes('sent') ? '#065f46' : '#856404',
                marginBottom: '15px'
              }}>
                {forgotPasswordMessage.includes('sent') ? '✅' : '⚠️'} {forgotPasswordMessage}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary login-button"
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordMessage(null);
                  setForgotPasswordEmail('');
                  setForgotPasswordUsername('');
                }}
                className="btn-secondary"
                style={{ width: '100%' }}
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" style={{ minHeight: '400px', padding: '20px' }}>
      <div className="login-card">
        <h2>🔐 Healthcare Login</h2>
        <p className="login-subtitle">Please login to access the healthcare platform</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Login As:</label>
            <select
              id="role"
              value={credentials.role}
              onChange={(e) => setCredentials({ ...credentials, role: e.target.value as UserRole })}
              className="form-select"
            >
              <option value="patient">👤 Patient</option>
              <option value="doctor">👨‍⚕️ Doctor</option>
              <option value="insurance-agent">🛡️ Insurance Agent</option>
              <option value="pharmacy">💊 Pharmacy</option>
              <option value="hospital">🏥 Hospital</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Enter username"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter password"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message" style={{ 
              padding: '12px', 
              background: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '6px', 
              color: '#856404',
              marginBottom: '15px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>Don't have an account?</p>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="btn-secondary"
              style={{ width: '100%' }}
            >
              📝 Create New Account
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="btn-secondary"
              style={{ 
                width: '100%', 
                background: 'transparent', 
                border: '1px solid #1E88E5',
                color: '#1E88E5'
              }}
            >
              🔑 Forgot Password?
            </button>
          </div>
        </form>

        <div className="quick-login-section">
          <p style={{ marginTop: '20px', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
            Quick Login (for testing):
          </p>
          <div className="quick-login-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <button
              type="button"
              className="quick-login-btn patient-btn"
              onClick={() => handleQuickLogin('patient1', 'patient123', 'patient')}
            >
              👤 Patient
            </button>
            <button
              type="button"
              className="quick-login-btn doctor-btn"
              onClick={() => handleQuickLogin('doctor1', 'doctor123', 'doctor')}
            >
              👨‍⚕️ Doctor
            </button>
            <button
              type="button"
              className="quick-login-btn"
              onClick={() => handleQuickLogin('insurance1', 'insurance123', 'insurance-agent')}
              style={{ background: '#3b82f6', color: 'white' }}
            >
              🛡️ Insurance
            </button>
            <button
              type="button"
              className="quick-login-btn"
              onClick={() => handleQuickLogin('pharmacy1', 'pharmacy123', 'pharmacy')}
              style={{ background: '#10b981', color: 'white' }}
            >
              💊 Pharmacy
            </button>
            <button
              type="button"
              className="quick-login-btn"
              onClick={() => handleQuickLogin('hospital1', 'hospital123', 'hospital')}
              style={{ background: '#8b5cf6', color: 'white' }}
            >
              🏥 Hospital
            </button>
            <button
              type="button"
              className="quick-login-btn"
              onClick={() => handleQuickLogin('admin', 'admin123', 'admin')}
              style={{ background: '#f59e0b', color: 'white' }}
            >
              👑 Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

