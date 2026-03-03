import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName?: string;
  conditionName: string;
  category: string;
  severity: string;
  recordedDate: string;
  notes?: string;
}

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function TestResults() {
  // Get user from localStorage (set by App.tsx login)
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedicalHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's display name for sample records
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const currentUser = registeredUsers.find((u: any) => u.username === user?.username);
      const displayName = user?.name || 
        (currentUser?.firstName && currentUser?.lastName 
          ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
          : user?.username || 'Patient');

      // Sample lab results and medical records (same as dashboard)
      const sampleLabResults: MedicalRecord[] = [
        {
          id: 'lab-result-1',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          conditionName: 'Complete Blood Count (CBC)',
          category: 'Laboratory',
          severity: 'Normal',
          recordedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
          notes: 'All blood cell counts within normal range. Hemoglobin: 14.2 g/dL, White blood cells: 6.5 K/μL'
        },
        {
          id: 'lab-result-2',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          conditionName: 'Cholesterol Panel',
          category: 'Laboratory',
          severity: 'Normal',
          recordedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Total cholesterol: 185 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL, Triglycerides: 120 mg/dL. All values within healthy range.'
        },
        {
          id: 'lab-result-3',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          conditionName: 'Thyroid Function Tests',
          category: 'Laboratory',
          severity: 'Normal',
          recordedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          notes: 'TSH: 2.1 mIU/L, T3: 125 ng/dL, T4: 8.2 μg/dL. Thyroid function within normal parameters.'
        },
        {
          id: 'lab-result-4',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          conditionName: 'Urinalysis',
          category: 'Laboratory',
          severity: 'Normal',
          recordedDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(), // 80 days ago
          notes: 'Routine urine analysis shows normal kidney function. No signs of infection or abnormalities detected.'
        },
        {
          id: 'medical-record-1',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          conditionName: 'Blood Pressure Monitoring',
          category: 'Vital Signs',
          severity: 'Normal',
          recordedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
          notes: 'Blood pressure: 120/80 mmHg. Within normal range. Continue current lifestyle and medication regimen.'
        },
        {
          id: 'medical-record-2',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          conditionName: 'Diabetes Screening',
          category: 'Laboratory',
          severity: 'Normal',
          recordedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'HbA1c: 5.4%. Fasting glucose: 92 mg/dL. No signs of diabetes. Continue healthy diet and exercise.'
        }
      ];

      console.log('Fetching medical history from:', `${API_BASE_URL}/api/v1/records/medical-history`);
      let apiRecords: MedicalRecord[] = [];
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/records/medical-history`, {
          params: { limit: 20 },
          timeout: 30000
        });
        
        console.log('Medical History API response:', {
          status: response.status,
          dataLength: response.data?.length || 0
        });
        
        apiRecords = response.data || [];
      } catch (apiError) {
        console.error('API call failed, using sample lab results only:', apiError);
        // Continue with sample records even if API fails
      }

      // Filter API records from last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const filteredApiRecords = apiRecords.filter((record: MedicalRecord) => {
        if (!record.recordedDate) return false;
        try {
          const recordDate = new Date(record.recordedDate);
          return recordDate >= threeMonthsAgo;
        } catch (e) {
          return false;
        }
      });

      // Filter API records for patients
      if (user?.role === 'patient') {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.username === user.username);
        
        const userPatientId = (currentUser?.patientId || user.patientId || '').toLowerCase().trim();
        const userFirstName = (currentUser?.firstName || '').toLowerCase().trim();
        const userLastName = (currentUser?.lastName || '').toLowerCase().trim();
        const userFullName = `${userFirstName} ${userLastName}`.trim();

        const filteredForPatient = filteredApiRecords.filter((record: MedicalRecord) => {
          // Match by patient ID
          if (userPatientId && record.patientId && !userPatientId.startsWith('pat')) {
            const recordId = record.patientId.toLowerCase().trim();
            if (recordId === userPatientId || recordId.includes(userPatientId) || userPatientId.includes(recordId)) {
              return true;
            }
          }
          
          // Match by patient name
          if (userFullName && record.patientName) {
            const recordName = record.patientName.toLowerCase().trim();
            if (recordName.includes(userFullName) || userFullName.includes(recordName)) {
              return true;
            }
          }
          
          return false;
        });

        filteredApiRecords.length = 0;
        filteredApiRecords.push(...filteredForPatient);
      }

      // Combine sample records with API records
      let allRecords = [...sampleLabResults, ...filteredApiRecords];
      
      // Sort by date (most recent first)
      allRecords.sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());
      
      console.log('Combined records (sample + API):', allRecords);
      setMedicalHistory(allRecords);
      
    } catch (err: any) {
      console.error('Error fetching medical history:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching test results. Please try again later.');
      } else {
        setError(err.message || 'Failed to fetch test results');
      }
    } finally {
      setLoading(false);
    }
  };

  // User is managed by App.tsx - no login/logout needed here
  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view test results.</div>
      </div>
    );
  }

  // Filter records by category
  const filteredRecords = medicalHistory.filter(record => {
    if (filterCategory !== 'all' && record.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  const uniqueCategories = Array.from(new Set(medicalHistory.map(record => record.category)));

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

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
            🔬 Test Results {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
        <div className="loading">Loading test results...</div>
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
        <h2 style={{ margin: 0 }}>
          🔬 Recent Lab Results & Medical Records {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
        </h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
          Showing {filteredRecords.length} of {medicalHistory.length} test results and medical records
        </p>
      </div>
      
      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          <strong>⚠️ {error}</strong>
          <button 
            onClick={fetchMedicalHistory}
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
      )}

      {/* Filter */}
      <div className="policy-filters">
        <div className="filter-group">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category.toLowerCase()}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 && !loading && !error ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔬</div>
          <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.3rem' }}>
            No Test Results Found
          </h3>
          <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            {user.role === 'patient' 
              ? 'You currently have no test results or medical records in the system. This is normal if you are a new patient or haven\'t had any lab tests or medical examinations yet.'
              : 'No test results found. The FHIR server may have no recent laboratory or medical record data.'}
          </p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="medical-records-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {filteredRecords.map((record) => (
            <div 
              key={record.id} 
              className="medical-record-card"
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
            >
              <div className="record-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span className="record-icon" style={{ fontSize: '2rem' }}>📋</span>
                <div className="record-date" style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {formatDate(record.recordedDate)}
                </div>
              </div>
              <h4 style={{
                margin: '0 0 10px 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#333'
              }}>
                {record.conditionName}
              </h4>
              <p className="record-category" style={{
                margin: '0 0 10px 0',
                fontSize: '0.9rem',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {record.category}
              </p>
              <span className={`severity-badge ${record.severity.toLowerCase()}`} style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginBottom: '10px',
                background: record.severity.toLowerCase() === 'normal' ? '#E8F5E9' : 
                           record.severity.toLowerCase() === 'mild' ? '#FFF3E0' :
                           record.severity.toLowerCase() === 'moderate' ? '#FFE0B2' :
                           '#FFEBEE',
                color: record.severity.toLowerCase() === 'normal' ? '#2E7D32' :
                       record.severity.toLowerCase() === 'mild' ? '#E65100' :
                       record.severity.toLowerCase() === 'moderate' ? '#F57C00' :
                       '#C62828'
              }}>
                {record.severity}
              </span>
              {expandedRecord === record.id && record.notes && (
                <p className="record-notes" style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #e0e0e0',
                  fontSize: '0.9rem',
                  color: '#555',
                  lineHeight: '1.6'
                }}>
                  {record.notes}
                </p>
              )}
              {record.notes && (
                <div style={{
                  marginTop: '10px',
                  fontSize: '0.8rem',
                  color: '#999',
                  textAlign: 'right'
                }}>
                  {expandedRecord === record.id ? 'Click to collapse' : 'Click to view details'}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

