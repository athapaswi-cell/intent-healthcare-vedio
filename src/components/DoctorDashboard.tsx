import React, { useState } from 'react';
import './Dashboard.css';
import PatientRegister from './PatientRegister';
import TelehealthVideoChat from './TelehealthVideoChat';

interface AppUser {
  username: string;
  role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';
  email?: string;
  name?: string;
}

interface DoctorDashboardProps {
  user: AppUser | null;
  onNavigate?: (section: string) => void;
}

export default function DoctorDashboard({ user, onNavigate }: DoctorDashboardProps) {
  const [showPatientRegistration, setShowPatientRegistration] = useState(false);
  const [telehealthOpen, setTelehealthOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{ id: number; patientName: string } | null>(null);
  
  // Get doctor's display name
  const displayName = user?.name || user?.username || 'Doctor';
  const doctorName = displayName.includes('Dr.') ? displayName : `Dr. ${displayName}`;

  // Sample data - in real app, this would come from API
  const todaysAppointments = [
    {
      id: 1,
      patientName: 'Dr. Sarah Bennett',
      time: 'April 28, 2024, 10:00 AM',
      doctorImage: '👩‍⚕️',
      isPrimary: true
    },
    {
      id: 2,
      patientName: 'Emily Wilson',
      time: '9:00 AM',
      specialty: 'General Practitioner',
      type: 'General Check-up',
      doctorImage: '👩‍⚕️'
    },
    {
      id: 3,
      patientName: 'Michael Anderson',
      time: '10:30 AM',
      type: 'Follow-up Visit',
      doctorImage: '👨‍⚕️'
    }
  ];

  const handleJoinTelehealth = (appointmentId: number, patientName: string) => {
    console.log('Joining telehealth for appointment:', appointmentId);
    setSelectedAppointment({ id: appointmentId, patientName });
    setTelehealthOpen(true);
  };

  const handleSwitchToTelehealth = (appointmentId: number, patientName: string) => {
    console.log('Switching to telehealth for appointment:', appointmentId);
    setSelectedAppointment({ id: appointmentId, patientName });
    setTelehealthOpen(true);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message">Welcome back, {doctorName}!</p>
      </div>

      {/* Today's Appointments Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">📅</span>
            Today's Appointments
          </h2>
          <a href="#" className="section-link">View All</a>
        </div>
        
        <div className="appointments-list">
          {todaysAppointments.map((appointment) => (
            <div key={appointment.id} className={`appointment-card ${appointment.id === 1 ? 'primary' : ''}`}>
              <div className="appointment-info">
                <div className="doctor-avatar">{appointment.doctorImage}</div>
                <div className="appointment-details">
                  <h3>{appointment.patientName}</h3>
                  {appointment.isPrimary && (
                    <p className="appointment-date">{appointment.time}</p>
                  )}
                  {!appointment.isPrimary && (
                    <>
                      <p className="appointment-time">{appointment.time}</p>
                      {appointment.specialty && <p className="appointment-specialty">{appointment.specialty}</p>}
                      {appointment.type && <p className="appointment-type">{appointment.type}</p>}
                    </>
                  )}
                </div>
              </div>
              {appointment.id === 1 || appointment.id === 2 ? (
                <button 
                  className="btn-telehealth"
                  onClick={() => handleJoinTelehealth(appointment.id, appointment.patientName)}
                >
                  <span className="btn-icon">✏️</span>
                  Join Telehealth
                </button>
              ) : (
                <button 
                  className="btn-switch-telehealth"
                  onClick={() => handleSwitchToTelehealth(appointment.id, appointment.patientName)}
                >
                  <span className="btn-icon">🔄</span>
                  Switch to Telehealth
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Patients Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>
              <span className="section-icon">👥</span>
              Patients
            </h2>
            <a href="#" className="section-link">View All</a>
          </div>
          
          <div className="patients-stats">
            <div className="stat-card primary-stat">
              <div className="stat-number">156</div>
              <div className="stat-label">Active Patients</div>
            </div>
            
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <div>
                  <div className="stat-value">12</div>
                  <div className="stat-desc">Upcoming appointments</div>
                </div>
              </div>
            </div>
            
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <div>
                  <div className="stat-value">87</div>
                  <div className="stat-desc">Pending Messages</div>
                  <div className="stat-subtext">Fire dim messages</div>
                </div>
              </div>
            </div>
            
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-icon">🧪</span>
                <div>
                  <div className="stat-value">15</div>
                  <div className="stat-desc">Lab Results Pending</div>
                  <div className="stat-subtext">General Tisling</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <button 
              className="action-button"
              onClick={() => setShowPatientRegistration(true)}
            >
              <span className="action-icon">👥</span>
              <span>Add New Patient</span>
            </button>
            
            <button className="action-button">
              <span className="action-icon">📅</span>
              <span>View Schedule</span>
            </button>
            
            <button className="action-button">
              <span className="action-icon">🧪</span>
              <span>Review Lab Results</span>
              <span className="action-badge">5 Unread</span>
            </button>
            
            <button 
              className="action-button"
              onClick={() => onNavigate?.('messages')}
            >
              <span className="action-icon">✉️</span>
              <span>Send Message</span>
            </button>
          </div>
        </section>
      </div>

      {/* Patient Registration Modal */}
      {showPatientRegistration && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPatientRegistration(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a1a' }}>Add New Patient</h2>
              <button
                onClick={() => setShowPatientRegistration(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <PatientRegister
                onRegister={(user) => {
                  // Handle patient registration
                  console.log('New patient registered:', user);
                  // Close modal and show success message
                  setShowPatientRegistration(false);
                  alert('Patient registered successfully!');
                }}
                onBackToLogin={() => setShowPatientRegistration(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Telehealth Video Chat Modal */}
      {telehealthOpen && selectedAppointment && (
        <TelehealthVideoChat
          isOpen={telehealthOpen}
          onClose={() => {
            setTelehealthOpen(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.id}
          doctorName={doctorName}
          patientName={selectedAppointment.patientName}
          userRole="doctor"
        />
      )}
    </div>
  );
}

