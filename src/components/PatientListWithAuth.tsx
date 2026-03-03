import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  blood_type?: string;
  allergies: string[];
  medical_history: string[];
}

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function PatientListWithAuth() {
  // Get user from localStorage (set by App.tsx login)
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPatients();
    } else {
      setLoading(false);
      setError('Please login to view patient information.');
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching patients from FHIR API...');
      
      // Fetch patients from FHIR API with increased timeout
      const response = await axios.get(`${API_BASE_URL}/api/v1/patients/`, {
        timeout: 30000  // Increased timeout to 30 seconds for FHIR API
      });
      
      const allPatients: Patient[] = response.data || [];
      console.log(`Received ${allPatients.length} patients from FHIR API`);
      
      if (allPatients.length === 0) {
        setError('No patients found in FHIR server. The FHIR server may not have Patient resources available.');
        setPatients([]);
        return;
      }

      // Filter patients based on user role
      if (user?.role === 'doctor') {
        // For doctors, show all patients (simplified approach)
        // In production, this would be filtered by actual doctor-patient relationships
        console.log(`Doctor ${user.username} viewing all ${allPatients.length} patients`);
        setPatients(allPatients);
      } else if (user?.role === 'patient') {
        // Patients see only their own record
        // Get registered user info for better matching
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.username === user.username);
        
        const userFirstName = currentUser?.firstName?.toLowerCase().trim() || '';
        const userLastName = currentUser?.lastName?.toLowerCase().trim() || '';
        const userFullName = `${userFirstName} ${userLastName}`.trim();
        const userPatientId = (currentUser?.patientId || user.patientId || '').toLowerCase().trim();
        const username = user.username?.toLowerCase().trim() || '';
        
        console.log('Filtering patients for patient user:', {
          username,
          userFullName,
          userPatientId,
          totalPatients: allPatients.length
        });
        
        // Helper function to normalize names for better matching
        const normalizeName = (name: string): string => {
          return name.toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .replace(/[^a-z0-9\s]/g, ''); // Remove special characters
        };
        
        // Helper function to check name similarity
        const namesMatch = (name1: string, name2: string): boolean => {
          const n1 = normalizeName(name1);
          const n2 = normalizeName(name2);
          
          // Exact match
          if (n1 === n2) return true;
          
          // Check if one name contains the other
          if (n1.includes(n2) || n2.includes(n1)) return true;
          
          // Check if both first and last names match (order-independent)
          const parts1 = n1.split(/\s+/).filter(p => p.length > 0);
          const parts2 = n2.split(/\s+/).filter(p => p.length > 0);
          
          if (parts1.length >= 2 && parts2.length >= 2) {
            const first1 = parts1[0];
            const last1 = parts1[parts1.length - 1];
            const first2 = parts2[0];
            const last2 = parts2[parts2.length - 1];
            
            if ((first1 === first2 && last1 === last2) || 
                (first1 === last2 && last1 === first2)) {
              return true;
            }
          }
          
          return false;
        };
        
        const filteredPatients = allPatients.filter(patient => {
          let matches = false;
          
          // Match by patient ID (exact or contains) - skip generated IDs like "pat638665"
          if (userPatientId && patient.id && !userPatientId.startsWith('pat')) {
            const patientId = patient.id.toLowerCase().trim();
            if (patientId === userPatientId || 
                patientId.includes(userPatientId) || 
                userPatientId.includes(patientId)) {
              matches = true;
              console.log('Matched by Patient ID:', patientId, 'with', userPatientId);
            }
          }
          
          // Match by patient name
          if (!matches && userFullName) {
            const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
            
            if (patientName && patientName.toLowerCase() !== 'unknown patient' && patientName.length > 0) {
              if (namesMatch(patientName, userFullName)) {
                matches = true;
                console.log('Matched by Name:', patientName, 'with', userFullName);
              }
            }
          }
          
          // Match by username as last resort
          if (!matches && username) {
            const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
            const normalizedPatientName = normalizeName(patientName);
            const normalizedUsername = normalizeName(username);
            
            if (normalizedPatientName && normalizedPatientName !== 'unknownpatient' && 
                (normalizedPatientName.includes(normalizedUsername) || normalizedUsername.includes(normalizedPatientName))) {
              matches = true;
              console.log('Matched by Username:', patientName, 'with', username);
            }
          }
          
          return matches;
        });
        
        console.log(`Filtered to ${filteredPatients.length} patients for patient user`);
        
        if (filteredPatients.length > 0) {
          setPatients(filteredPatients);
        } else {
          // No matches found - show helpful message
          setError(`No patient records found matching your profile. This could mean:
          
1. Your patient record is not yet in the FHIR system
2. There may be a name/ID mismatch between your registration and FHIR data
3. The FHIR server may not have your specific patient data

Please contact your healthcare provider if you believe this is an error.`);
          setPatients([]);
        }
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      console.error('Error fetching patients from FHIR:', err);
      
      if (axios.isCancel(err)) {
        setError('Request cancelled.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching patients. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('Patients endpoint not found. Ensure backend is running and configured correctly.');
      } else {
        setError(`Failed to fetch patients from FHIR server: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // User is managed by App.tsx - no login/logout needed here
  if (loading) {
    return (
      <div className="data-list">
        <div className="user-header" style={{ 
          marginBottom: '20px',
          padding: '15px',
          background: '#E3F2FD',
          borderRadius: '8px'
        }}>
          <h2 style={{ margin: 0 }}>
            👥 Patients {user?.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
        <div className="loading">Loading patients from FHIR server...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-list">
        <div className="user-header" style={{ 
          marginBottom: '20px',
          padding: '15px',
          background: '#E3F2FD',
          borderRadius: '8px'
        }}>
          <h2 style={{ margin: 0 }}>
            👥 Patients {user?.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px',
          whiteSpace: 'pre-line'
        }}>
          <strong>⚠️ {error.split('\n')[0]}</strong>
          {error.includes('\n') && (
            <div style={{ marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {error.split('\n').slice(1).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}
          <p style={{ marginTop: '10px', marginBottom: '10px', fontSize: '0.9rem' }}>
            {user?.role === 'patient' 
              ? 'If you believe this is an error, please contact your healthcare provider.'
              : 'The FHIR server may be experiencing high load. You can try refreshing the page.'}
          </p>
          <button 
            onClick={fetchPatients}
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: loading ? '#ccc' : '#1E88E5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view patient information.</div>
      </div>
    );
  }

  return (
    <div className="data-list">
      <div className="user-header" style={{ 
        marginBottom: '20px',
        padding: '15px',
        background: '#E3F2FD',
        borderRadius: '8px'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>
            👥 Patients {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="no-data">
          <p>No patient records found.</p>
          {user.role === 'patient' && (
            <p style={{ marginTop: '10px', color: '#666' }}>
              If you believe this is an error, please contact your healthcare provider.
            </p>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '15px', color: '#666' }}>
            {user.role === 'doctor' ? (
              <p>Showing {patients.length} patient(s) you have consulted</p>
            ) : (
              <p>Showing your patient record</p>
            )}
          </div>
          <div className="cards-grid">
            {patients.map((patient) => (
              <div key={patient.id} className="data-card">
                <h3>{patient.first_name} {patient.last_name}</h3>
                <div className="card-details">
                  <p><strong>Patient ID:</strong> {patient.id}</p>
                  <p><strong>DOB:</strong> {patient.date_of_birth}</p>
                  <p><strong>Gender:</strong> {patient.gender}</p>
                  {patient.blood_type && <p><strong>Blood Type:</strong> {patient.blood_type}</p>}
                  {patient.phone && <p><strong>Phone:</strong> {patient.phone}</p>}
                  {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
                  {patient.allergies.length > 0 && (
                    <p><strong>Allergies:</strong> {patient.allergies.join(', ')}</p>
                  )}
                  {patient.medical_history.length > 0 && (
                    <p><strong>Medical History:</strong> {patient.medical_history.join(', ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

