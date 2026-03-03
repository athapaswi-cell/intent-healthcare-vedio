import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface VisitItem {
  id: string;
  patientId: string;
  patientName?: string;
  hospitalId?: string;
  hospitalName?: string;
  encounterType: string;
  encounterCode?: string;
  status: string;
  startDate: string;
  startTime?: string;
  endDate?: string | null;
  endTime?: string | null;
  duration?: string;
  durationMinutes?: number;
  location?: string;
  reason?: string;
  diagnoses?: { code: string; display: string }[] | string[];
  participants?: { type: string; name: string; reference?: string }[];
}

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function PatientVisitsWithAuth() {
  // Get user from localStorage (set by App.tsx login)
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVisits();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's display name for sample visits
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const currentUser = registeredUsers.find((u: any) => u.username === user?.username);
      const displayName = user?.name || 
        (currentUser?.firstName && currentUser?.lastName 
          ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
          : user?.username || 'Patient');

      // Always start with comprehensive dental and lab visits (same as dashboard)
      const dentalAndLabVisits: VisitItem[] = [
        // Dental Visits
        {
          id: 'dental-1',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          hospitalId: 'dental-clinic-1',
          hospitalName: 'Bright Smile Dental Center',
          encounterType: 'Dental Cleaning',
          status: 'Finished',
          startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
          endDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          startTime: '10:00',
          endTime: '11:00',
          durationMinutes: 60,
          location: 'Bright Smile Dental Center',
          reason: 'Routine Dental Maintenance',
          diagnoses: ['Routine Dental Maintenance'],
          participants: [{ type: 'Practitioner', name: 'Dr. Sarah Johnson, DDS', reference: 'dentist-1' }]
        },
        {
          id: 'dental-2',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          hospitalId: 'dental-clinic-2',
          hospitalName: 'Family Dental Practice',
          encounterType: 'Dental X-Ray',
          status: 'Finished',
          startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
          endDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          startTime: '14:00',
          endTime: '14:30',
          durationMinutes: 30,
          location: 'Family Dental Practice',
          reason: 'Dental Imaging',
          diagnoses: ['Dental Imaging'],
          participants: [{ type: 'Practitioner', name: 'Dr. Michael Rodriguez, DDS', reference: 'dentist-2' }]
        },
        {
          id: 'dental-3',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          hospitalId: 'dental-clinic-3',
          hospitalName: 'Advanced Dental Specialists',
          encounterType: 'Dental Consultation',
          status: 'Finished',
          startDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(), // 70 days ago
          endDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          startTime: '09:00',
          endTime: '09:45',
          durationMinutes: 45,
          location: 'Advanced Dental Specialists',
          reason: 'Orthodontic Evaluation',
          diagnoses: ['Orthodontic Evaluation'],
          participants: [{ type: 'Practitioner', name: 'Dr. Emily Chen, DDS', reference: 'dentist-3' }]
        },
        // Lab Test Visits
        {
          id: 'lab-1',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          hospitalId: 'lab-center-1',
          hospitalName: 'Medical Lab Center',
          encounterType: 'Laboratory Tests',
          status: 'Finished',
          startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
          endDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          startTime: '08:00',
          endTime: '10:00',
          durationMinutes: 120,
          location: 'Medical Lab Center',
          reason: 'Blood Work Analysis',
          diagnoses: ['Blood Work Analysis'],
          participants: [{ type: 'Practitioner', name: 'Dr. Jennifer Wilson, MD', reference: 'lab-tech-1' }]
        },
        {
          id: 'lab-2',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          hospitalId: 'lab-center-2',
          hospitalName: 'Quest Diagnostics',
          encounterType: 'Lab Work - Blood Tests',
          status: 'Finished',
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          startTime: '07:30',
          endTime: '09:00',
          durationMinutes: 90,
          location: 'Quest Diagnostics',
          reason: 'Thyroid Function Tests',
          diagnoses: ['Thyroid Function Tests'],
          participants: [{ type: 'Practitioner', name: 'Dr. Robert Kim, MD', reference: 'lab-tech-2' }]
        },
        {
          id: 'lab-3',
          patientId: user?.patientId || 'patient-1',
          patientName: displayName,
          hospitalId: 'lab-center-3',
          hospitalName: 'LabCorp',
          encounterType: 'Lab Work - Urine Analysis',
          status: 'Finished',
          startDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(), // 80 days ago
          endDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          startTime: '11:00',
          endTime: '11:30',
          durationMinutes: 30,
          location: 'LabCorp',
          reason: 'Urinalysis',
          diagnoses: ['Urinalysis'],
          participants: [{ type: 'Practitioner', name: 'Dr. Amanda Martinez, MD', reference: 'lab-tech-3' }]
        }
      ];

      console.log('Fetching visits from:', `${API_BASE_URL}/api/v1/records/visits`);
      let apiVisits: VisitItem[] = [];
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
          params: { limit: 50 },  // Increased limit to get more data
          timeout: 30000  // Increased timeout to 30 seconds for name fetching
        });
        
        console.log('Visits API response:', {
          status: response.status,
          dataLength: response.data?.length || 0,
          firstVisit: response.data?.[0]
        });
        
        apiVisits = response.data || [];
      } catch (apiError) {
        console.error('API call failed, using dental and lab visits only:', apiError);
        // Continue with sample visits even if API fails
      }
      
      // Filter API visits from last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const filteredApiVisits = apiVisits.filter((visit: VisitItem) => {
        if (!visit.startDate) return false;
        try {
          const visitDate = new Date(visit.startDate);
          return visitDate >= threeMonthsAgo;
        } catch (e) {
          return false;
        }
      });
      
      // Combine dental/lab visits with API visits
      let visitsData = [...dentalAndLabVisits, ...filteredApiVisits];
      
      // Sort by date (most recent first)
      visitsData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      console.log('Combined visits (dental + lab + API):', visitsData);
      
      // If no data returned from API, show helpful message
      if (visitsData.length === 0) {
        console.warn('No visits data returned from API. FHIR server may have no Encounter resources.');
        setVisits([]);
        setLoading(false);
        setError(null); // Don't show error, just show "no data" message
        // Continue to show the "no data" UI message
        return;
      }
      
      console.log(`Received ${visitsData.length} visits (dental + lab + API) before filtering`);
      
      // Track what we are matching against for debugging/error messages
      let targetPatientId = '';
      let targetPatientName = '';

      // Filter based on user role (keep sample visits, only filter API visits)
      if (user?.role === 'patient') {
        // Separate sample visits from API visits
        const sampleVisitIds = dentalAndLabVisits.map(v => v.id);
        const sampleVisits = visitsData.filter(v => sampleVisitIds.includes(v.id));
        const apiVisitsToFilter = visitsData.filter(v => !sampleVisitIds.includes(v.id));
        
        // Get registered user info for better matching
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.username === user.username);
        
        const userFirstName = currentUser?.firstName?.toLowerCase().trim() || '';
        const userLastName = currentUser?.lastName?.toLowerCase().trim() || '';
        const userFullName = `${userFirstName} ${userLastName}`.trim();
        const userPatientId = (currentUser?.patientId || user.patientId || '').toLowerCase().trim();
        const username = user.username?.toLowerCase().trim() || '';

        targetPatientId = userPatientId;
        targetPatientName = userFullName || username;
        
        console.log('Filtering API visits for patient (keeping sample visits):', {
          username,
          userFullName,
          userPatientId,
          sampleVisitsCount: sampleVisits.length,
          apiVisitsToFilterCount: apiVisitsToFilter.length
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
          
          // Check if any significant part matches (minimum 3 characters)
          for (const part1 of parts1) {
            if (part1.length >= 3) {
              for (const part2 of parts2) {
                if (part1 === part2 && part1.length >= 3) {
                  return true;
                }
              }
            }
          }
          
          return false;
        };
        
        // Filter only API visits, keep all sample visits
        const filteredApiVisits = apiVisitsToFilter.filter(visit => {
          let matches = false;
          
          // Match by patient ID (exact or contains) - skip generated IDs like "pat638665"
          if (userPatientId && visit.patientId && !userPatientId.startsWith('pat')) {
            const visitId = visit.patientId.toLowerCase().trim();
            const userId = userPatientId.toLowerCase().trim();
            if (visitId === userId || 
                visitId.includes(userId) || 
                userId.includes(visitId)) {
              matches = true;
            }
          }
          
          // Match by patient name (improved matching with variations)
          if (!matches && visit.patientName && userFullName) {
            const visitName = visit.patientName.trim();
            
            // Skip "Unknown Patient" or empty names
            if (visitName && visitName.toLowerCase() !== 'unknown patient' && visitName.length > 0) {
              if (namesMatch(visitName, userFullName)) {
                matches = true;
              } else {
                // Additional check: match by individual name parts
                const visitParts = normalizeName(visitName).split(/\s+/);
                
                // Check if first name matches
                if (userFirstName && visitParts.some(part => part === userFirstName && part.length >= 3)) {
                  matches = true;
                }
                // Check if last name matches
                else if (userLastName && visitParts.some(part => part === userLastName && part.length >= 3)) {
                  matches = true;
                }
              }
            }
          }
          
          // Match by username as last resort (only if no other match)
          if (!matches && visit.patientName && username) {
            const visitName = normalizeName(visit.patientName);
            const user = normalizeName(username);
            if (visitName && visitName !== 'unknownpatient' && 
                (visitName.includes(user) || user.includes(visitName))) {
              matches = true;
            }
          }
          
          return matches;
        });
        
        // Combine sample visits with filtered API visits
        visitsData = [...sampleVisits, ...filteredApiVisits];
        
        console.log('Final visits count (sample + filtered API):', visitsData.length);
      } else if (user?.role === 'doctor') {
        // For doctors, show all visits (filtering is complex and may hide data)
        // TODO: Can implement doctor-specific filtering later if needed
        console.log(`Doctor logged in. Showing all ${visitsData.length} visits.`);
        // Keep all visits - don't filter for now to ensure data is visible
      }
      
      setVisits(visitsData);
      
      // Clear any previous errors when data is successfully fetched
      if (visitsData.length === 0) {
        // This is a normal case - no records found, not an error
        setError(null);
      } else {
        // Clear error if we have data
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching visits:', err);
      if (axios.isCancel(err)) {
        setError('Request cancelled.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching visits. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('Visits endpoint not found. Ensure backend is running and configured correctly.');
      } else {
        setError(err.message || 'Failed to fetch visits');
      }
    } finally {
      setLoading(false);
    }
  };

  // User is managed by App.tsx - no login/logout needed here
  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view visits.</div>
      </div>
    );
  }

  // Calculate date 3 months ago
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

  // Filter visits - only show past visits from last 3 months
  // Also include visits that might be slightly in the future (scheduled visits)
  const pastVisits = visits.filter(visit => {
    if (!visit.startDate) return false;
    try {
      const visitDate = new Date(visit.startDate);
      visitDate.setHours(0, 0, 0, 0); // Normalize to start of day
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      // Include visits from last 3 months up to today (or slightly in future for scheduled)
      return visitDate >= threeMonthsAgo && visitDate <= today;
    } catch (e) {
      console.error('Error parsing visit date:', visit.startDate, e);
      return false;
    }
  });

  // If no visits in last 3 months, show all visits with a note
  const visitsToShow = pastVisits.length > 0 ? pastVisits : visits;
  const showingAllVisits = pastVisits.length === 0 && visits.length > 0;

  // Filter visits by status and type
  const filteredVisits = visitsToShow.filter(visit => {
    if (filterStatus !== 'all' && visit.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (filterType !== 'all' && visit.encounterType.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Sort visits by date (most recent first) for display
  const sortedFilteredVisits = [...filteredVisits].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateB - dateA; // Most recent first
  });

  // Calculate visit summary statistics (use pastVisits for summary, or all visits if none in last 3 months)
  const summaryVisits = pastVisits.length > 0 ? pastVisits : visitsToShow;
  const visitSummary = {
    totalVisits: summaryVisits.length,
    past3Months: pastVisits.length,
    byStatus: summaryVisits.reduce((acc, visit) => {
      acc[visit.status] = (acc[visit.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: summaryVisits.reduce((acc, visit) => {
      acc[visit.encounterType] = (acc[visit.encounterType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    mostRecent: summaryVisits.length > 0 
      ? [...summaryVisits].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
      : null,
    averageDuration: summaryVisits.length > 0
      ? Math.round(
          summaryVisits
            .filter(v => v.durationMinutes)
            .reduce((sum, v) => sum + (v.durationMinutes || 0), 0) /
          summaryVisits.filter(v => v.durationMinutes).length
        )
      : 0,
    hospitals: Array.from(new Set(summaryVisits.map(v => v.hospitalName).filter(Boolean))).length
  };

  const uniqueStatuses = Array.from(new Set(visits.map(visit => visit.status)));
  const uniqueTypes = Array.from(new Set(visits.map(visit => visit.encounterType)));

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
              🏥 Patient Visits {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
        <div className="loading">Loading visits...</div>
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
              🏥 Past Visits {pastVisits.length > 0 ? '(Last 3 Months)' : '(All Available)'} - Enhanced Version {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
        </h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
          {pastVisits.length > 0 
            ? `Showing ${filteredVisits.length} of ${pastVisits.length} visits from the last 3 months`
            : showingAllVisits
              ? `No visits found in last 3 months. Showing all ${filteredVisits.length} available visit(s)`
              : `Showing ${filteredVisits.length} visit(s)`
          }
        </p>
        {showingAllVisits && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#fff3cd',
            borderRadius: '6px',
            border: '1px solid #ffc107',
            fontSize: '0.85rem',
            color: '#856404'
          }}>
            ℹ️ Note: No visits found in the last 3 months. Displaying all available visits from your records.
          </div>
        )}
      </div>

      {/* Visit Summary Section */}
      {summaryVisits.length > 0 && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: '600' }}>
            📊 Visit Summary {pastVisits.length > 0 ? '(Last 3 Months)' : '(All Available)'}
          </h3>
          {pastVisits.length === 0 && visits.length > 0 && (
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', opacity: 0.9 }}>
              Showing summary for all available visits (no visits found in last 3 months)
            </p>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '15px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '15px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {visitSummary.totalVisits}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {pastVisits.length > 0 ? 'Visits (Last 3M)' : 'Total Visits'}
              </div>
              {pastVisits.length > 0 && visitSummary.past3Months < visitSummary.totalVisits && (
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '3px' }}>
                  ({visitSummary.past3Months} in last 3M)
                </div>
              )}
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '15px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {visitSummary.hospitals}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Hospitals Visited</div>
            </div>
            
            {visitSummary.averageDuration > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '15px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  {visitSummary.averageDuration} min
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg. Duration</div>
              </div>
            )}
            
            {visitSummary.mostRecent && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '15px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '5px', opacity: 0.9 }}>
                  Most Recent
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                  {new Date(visitSummary.mostRecent.startDate).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '3px' }}>
                  {visitSummary.mostRecent.encounterType}
                </div>
              </div>
            )}
          </div>

          {/* Breakdown by Status and Type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {Object.keys(visitSummary.byStatus).length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '15px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>By Status</h4>
                {Object.entries(visitSummary.byStatus).map(([status, count]) => (
                  <div key={status} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '5px',
                    fontSize: '0.9rem'
                  }}>
                    <span>{status}</span>
                    <span style={{ fontWeight: '600' }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
            
            {Object.keys(visitSummary.byType).length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '15px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>By Visit Type</h4>
                {Object.entries(visitSummary.byType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '5px',
                      fontSize: '0.9rem'
                    }}>
                      <span>{type}</span>
                      <span style={{ fontWeight: '600' }}>{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      
          {error && (
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
            {user.role === 'patient' 
              ? 'If you believe this is an error, please contact your healthcare provider.'
              : 'The FHIR server may be experiencing high load. You can try refreshing the page.'}
          </p>
          <button 
            onClick={fetchVisits}
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

      {/* Filters */}
      <div className="policy-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status.toLowerCase()}>{status}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-filter">Filter by Type:</label>
          <select
            id="type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {sortedFilteredVisits.length === 0 && !loading && !error ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏥</div>
          <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.3rem' }}>
            No Past Visits Found (Last 3 Months)
          </h3>
          <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            {user.role === 'patient' 
              ? 'You have no visit records from the last 3 months. This is normal if you are a new patient or haven\'t had any hospital visits or appointments recently.'
              : 'No visit records found from the last 3 months. The FHIR server may have no recent Encounter resources, or visits may be older than 3 months.'}
          </p>
          {visits.length > 0 && (
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '15px', fontStyle: 'italic' }}>
              Note: You have {visits.length} total visit(s) in the system, but none from the last 3 months.
            </p>
          )}
        </div>
      ) : sortedFilteredVisits.length > 0 ? (
        <>
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#333' }}>
              📋 All Past Visits {pastVisits.length > 0 ? '(Last 3 Months)' : '(All Available)'} - Enhanced Version
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              Click on any visit card to view detailed information
            </p>
          </div>
          <div className="cards-grid">
            {sortedFilteredVisits.map((visit) => (
            <div 
              key={visit.id} 
              className={`data-card visit-card ${expandedVisit === visit.id ? 'expanded' : ''}`}
              onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
            >
              <div className="visit-header">
                <div>
                  <h3>{visit.encounterType}</h3>
                  {visit.patientName && user.role === 'doctor' && (
                    <p className="visit-patient">Patient: {visit.patientName}</p>
                  )}
                  {visit.hospitalName && (
                    <p className="visit-hospital">Hospital: {visit.hospitalName}</p>
                  )}
                </div>
                <span className={`status-badge visit-status ${visit.status.toLowerCase().replace(' ', '-')}`}>
                  {visit.status}
                </span>
              </div>
              {expandedVisit === visit.id && (
                <div className="card-details">
                  <p><strong>Start:</strong> {new Date(visit.startDate).toLocaleString()}</p>
                  {visit.endDate && <p><strong>End:</strong> {new Date(visit.endDate).toLocaleString()}</p>}
                  {visit.duration && <p><strong>Duration:</strong> {visit.duration}</p>}
                  {visit.location && <p><strong>Location:</strong> {visit.location}</p>}
                  {visit.reason && <p><strong>Reason:</strong> {visit.reason}</p>}
                  {visit.startTime && <p><strong>Time:</strong> {visit.startTime}</p>}
                  {visit.endTime && <p><strong>End Time:</strong> {visit.endTime}</p>}
                  {visit.durationMinutes && (
                    <p><strong>Duration:</strong> {
                      visit.durationMinutes < 60 
                        ? `${visit.durationMinutes} min`
                        : `${Math.floor(visit.durationMinutes / 60)}h ${visit.durationMinutes % 60}min`
                    }</p>
                  )}
                  
                  {(visit.diagnoses || visit.participants || visit.encounterCode) && (
                    <div className="visit-details-section">
                      <button
                        className="details-toggle-button"
                        onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                      >
                        {expandedVisit === visit.id ? '▼ Hide Details' : '▶ Show Details'}
                      </button>
                      {expandedVisit === visit.id && (
                        <div className="visit-details">
                          {visit.encounterCode && <p><strong>Encounter Code:</strong> {visit.encounterCode}</p>}
                          {visit.diagnoses && visit.diagnoses.length > 0 && (
                            <div>
                              <h4>Diagnoses:</h4>
                              <ul>
                                {visit.diagnoses.map((diag: any, idx: number) => (
                                  <li key={idx}>
                                    {typeof diag === 'string' ? diag : `${diag.display || diag.name} (${diag.code || ''})`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {visit.participants && visit.participants.length > 0 && (
                            <div>
                              <h4>Participants:</h4>
                              <ul>
                                {visit.participants.map((part: any, idx: number) => (
                                  <li key={idx}>
                                    {part.name || part.reference} ({part.type || 'Staff'})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
              ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

