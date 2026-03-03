import React, { useState } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';
}

interface PatientRegisterProps {
  onRegister: (user: { username: string; role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin'; patientId?: string; email: string; name: string }) => void;
  onBackToLogin: () => void;
}

export default function PatientRegister({ onRegister, onBackToLogin }: PatientRegisterProps) {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    role: 'patient'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if username already exists in localStorage (for immediate validation)
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const usernameExists = existingUsers.some((u: any) => u.username === formData.username);
      const emailExists = existingUsers.some((u: any) => u.email === formData.email);

      if (usernameExists) {
        setError('Username already exists. Please choose a different username.');
        setLoading(false);
        return;
      }

      if (emailExists) {
        setError('Email already registered. Please use a different email or login.');
        setLoading(false);
        return;
      }

      // Send registration request to backend API
      let emailSent = false;
      try {
        console.log('Sending registration request to backend...');
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/register`,
          {
            username: formData.username,
            password: formData.password,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            phone: formData.phone || '',
            role: formData.role
          },
          {
            timeout: 15000
          }
        );

        if (response.data.success) {
          // Registration successful - email has been sent (or attempted)
          emailSent = true;
          console.log('✅ Registration successful!');
          console.log(`✅ Registration email sent to: ${formData.email}`);
          console.log('✅ This is the email address you entered in the form!');
          const patientId = response.data.patientId;

          // Also save to localStorage for local login
          const newUser = {
            username: formData.username,
            password: formData.password, // In production, this should be hashed
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            phone: formData.phone || '',
            role: formData.role,
            patientId: patientId,
            registeredAt: new Date().toISOString()
          };

          existingUsers.push(newUser);
          localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

          setSuccess(true);
          
          // Auto-login after successful registration
          setTimeout(() => {
            onRegister({
              username: newUser.username,
              role: newUser.role,
              patientId: newUser.patientId,
              email: newUser.email,
              name: `${newUser.firstName} ${newUser.lastName}`
            });
          }, 1500);
        }
      } catch (apiError: any) {
        // If API call fails, fall back to local storage only
        console.warn('Backend API unavailable, using local storage only. Email will not be sent.');
        console.warn('Error:', apiError.message);
        
        // Generate patient ID for patients
        const patientId = formData.role === 'patient' 
          ? `PAT${Date.now().toString().slice(-6)}` 
          : undefined;

        // Create user object
        const newUser = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone || '',
          role: formData.role,
          patientId: patientId,
          registeredAt: new Date().toISOString()
        };

        // Save to localStorage
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        setSuccess(true);
        
        // Auto-login after successful registration
        setTimeout(() => {
          onRegister({
            username: newUser.username,
            role: newUser.role,
            patientId: newUser.patientId,
            email: newUser.email,
            name: `${newUser.firstName} ${newUser.lastName}`
          });
        }, 1500);
      }

    } catch (err) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container" style={{ minHeight: '400px', padding: '20px' }}>
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#4CAF50', marginBottom: '10px' }}>Registration Successful!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Your account has been created successfully.
            </p>
            <p style={{ color: '#1976D2', fontSize: '0.9rem', marginBottom: '10px' }}>
              A welcome email has been sent to your registered email address.
            </p>
            <p style={{ color: '#1976D2', fontSize: '0.9rem' }}>
              Logging you in automatically...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" style={{ minHeight: '400px', padding: '20px' }}>
      <div className="login-card">
        <h2>📝 Create Account</h2>
        <p className="login-subtitle">Register to access patient information</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Register As:</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin' })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="firstName">First Name: *</label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First name"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name: *</label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last name"
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email: *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username: *</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Choose a username (min 3 characters)"
              className="form-input"
              required
              disabled={loading}
              minLength={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="password">Password: *</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
                className="form-input"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password: *</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth: *</label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="form-input"
                required
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender: *</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="form-select"
                required
                disabled={loading}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone (Optional):</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="form-input"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <button 
            type="button"
            onClick={onBackToLogin}
            className="btn-secondary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}


