import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';
import CreateAppointmentModal from './CreateAppointmentModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface AppointmentItem {
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
  isToday?: boolean;
}

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function Appointments() {
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleInterface, setShowScheduleInterface] = useState(false);
  const [showFeeDisclosure, setShowFeeDisclosure] = useState(false);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchHospitals();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 10000
      });
      setHospitals(response.data || []);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setHospitals([]);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching appointments from:', `${API_BASE_URL}/api/v1/records/visits`);
      const response = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
        params: { limit: 50 },
        timeout: 30000
      });
      
      console.log('Appointments API response:', {
        status: response.status,
        dataLength: response.data?.length || 0
      });
      
      let appointmentsData = response.data || [];
      
      if (appointmentsData.length === 0) {
        console.warn('No appointments data returned from API.');
        setAppointments([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Fetch all patients to populate patient names
      let patientsMap = new Map<string, string>(); // patient_id -> full name
      try {
        const patientsResponse = await axios.get(`${API_BASE_URL}/api/v1/patients/`, {
          timeout: 10000
        });
        const patients = patientsResponse.data || [];
        
        // Create a map of patient_id to patient name
        patients.forEach((patient: any) => {
          const patientId = patient.id;
          const firstName = patient.first_name || '';
          const lastName = patient.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          if (patientId && fullName) {
            // Store with lowercase for matching
            patientsMap.set(patientId.toLowerCase(), fullName);
            // Also store variations (if patient_id contains slashes or prefixes)
            const cleanId = patientId.replace(/^Patient\//, '').replace(/^patient\//, '').toLowerCase();
            if (cleanId !== patientId.toLowerCase()) {
              patientsMap.set(cleanId, fullName);
            }
          }
        });
        
        console.log(`Fetched ${patients.length} patients for name mapping`);
      } catch (patientsError) {
        console.warn('Could not fetch patients for name mapping:', patientsError);
      }

      // Populate patient names in appointments
      appointmentsData = appointmentsData.map((appointment: AppointmentItem) => {
        if (!appointment.patientName || appointment.patientName === 'Unknown Patient') {
          const appointmentPatientId = (appointment.patientId || '').toLowerCase().trim();
          
          // Try exact match first
          let patientName = patientsMap.get(appointmentPatientId);
          
          // Try with Patient/ prefix
          if (!patientName) {
            patientName = patientsMap.get(`patient/${appointmentPatientId}`);
          }
          
          // Try without Patient/ prefix
          if (!patientName) {
            const cleanId = appointmentPatientId.replace(/^patient\//, '').replace(/^Patient\//, '');
            patientName = patientsMap.get(cleanId);
          }
          
          // Try partial matching if exact match fails
          if (!patientName) {
            for (const [pid, pname] of patientsMap.entries()) {
              if (appointmentPatientId.includes(pid) || pid.includes(appointmentPatientId)) {
                patientName = pname;
                break;
              }
            }
          }
          
          if (patientName) {
            return { ...appointment, patientName: patientName };
          }
        }
        return appointment;
      });
      
      // Load appointments from localStorage (for newly created appointments)
      const createdAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      
      // Filter created appointments by patient if user is a patient
      let patientCreatedAppointments = createdAppointments;
      if (user?.role === 'patient') {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.username === user.username);
        const userPatientId = (currentUser?.patientId || user.patientId || '').toLowerCase().trim();
        const userFirstName = (currentUser?.firstName || '').toLowerCase().trim();
        const userLastName = (currentUser?.lastName || '').toLowerCase().trim();
        const userFullName = `${userFirstName} ${userLastName}`.trim();
        
        if (userPatientId || userFullName) {
          patientCreatedAppointments = createdAppointments.filter((apt: any) => {
            const aptPatientId = (apt.patientId || '').toLowerCase().trim();
            const aptPatientName = (apt.patientName || '').toLowerCase().trim();
            
            // Match by patient ID
            if (userPatientId && aptPatientId && 
                (aptPatientId === userPatientId || aptPatientId.includes(userPatientId) || userPatientId.includes(aptPatientId))) {
              return true;
            }
            
            // Match by patient name
            if (userFullName && aptPatientName && 
                (aptPatientName.includes(userFullName) || userFullName.includes(aptPatientName))) {
              return true;
            }
            
            return false;
          });
        }
      }

      // Filter based on user role
      if (user?.role === 'doctor') {
        // Filter appointments for this doctor's patients
        try {
          // Fetch visits to find which patients this doctor has consulted
          const visitsResponse = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
            params: { limit: 100 },
            timeout: 15000
          });
          
          const allVisits = visitsResponse.data || [];
          
          // Get doctor's name/username for matching
          const doctorUsername = user.username?.toLowerCase() || '';
          const doctorName = user.name?.toLowerCase() || '';
          
          // Collect patient IDs from visits where this doctor participated
          const patientIdsSet = new Set<string>();
          
          for (const visit of allVisits) {
            const participants = visit.participants || [];
            let doctorMatched = false;
            
            // Try to match doctor by checking participant references
            try {
              const doctorsResponse = await axios.get(`${API_BASE_URL}/api/v1/doctors/`, {
                timeout: 5000
              });
              const doctors = doctorsResponse.data || [];
              
              // Find matching doctor by username or name
              const matchedDoctor = doctors.find((d: any) => {
                const docFirst = (d.first_name || '').toLowerCase();
                const docLast = (d.last_name || '').toLowerCase();
                const docFullName = `${docFirst} ${docLast}`.trim();
                const docUsername = (d.email || d.id || '').toLowerCase();
                
                return doctorUsername && (
                  docUsername.includes(doctorUsername) ||
                  doctorUsername.includes(docUsername) ||
                  docFullName.includes(doctorName) ||
                  doctorName.includes(docFullName)
                );
              });
              
              if (matchedDoctor) {
                const doctorId = matchedDoctor.id;
                // Check if this doctor ID is in the visit participants
                for (const participant of participants) {
                  const participantRef = (participant.reference || '').toLowerCase();
                  if (participantRef.includes(doctorId.toLowerCase()) || 
                      (participantRef.includes('practitioner') && participantRef.includes(doctorId.toLowerCase()))) {
                    doctorMatched = true;
                    break;
                  }
                }
              }
            } catch (docError) {
              console.log('Could not fetch doctors for matching:', docError);
            }
            
            // If doctor matched, add patient ID to set (not appointment ID)
            if (doctorMatched && visit.patientId) {
              patientIdsSet.add(visit.patientId);
              console.log(`Doctor matched visit for patient: ${visit.patientName || visit.patientId}`);
            }
          }
          
          // Filter appointments to show ALL appointments for patients this doctor has consulted
          const consultedPatientIds = Array.from(patientIdsSet);
          
          console.log(`Doctor has consulted with ${consultedPatientIds.length} patients:`, consultedPatientIds);
          console.log(`Total appointments before filtering: ${appointmentsData.length}`);
          
          if (consultedPatientIds.length > 0) {
            const originalAppointmentsCount = appointmentsData.length;
            appointmentsData = appointmentsData.filter((apt: AppointmentItem) => {
              const aptPatientId = (apt.patientId || '').toLowerCase().trim();
              
              // Try to match with any of the consulted patient IDs
              const matches = consultedPatientIds.some(pid => {
                const patientId = pid.toLowerCase().trim();
                
                // Exact match
                if (aptPatientId === patientId) {
                  return true;
                }
                
                // Remove common prefixes for matching
                const cleanAptId = aptPatientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                const cleanPid = patientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                
                // Try cleaned IDs
                if (cleanAptId === cleanPid) {
                  return true;
                }
                
                // Partial matching (either contains the other)
                if (aptPatientId && patientId && (aptPatientId.includes(patientId) || patientId.includes(aptPatientId))) {
                  return true;
                }
                
                // Try cleaned partial matching
                if (cleanAptId && cleanPid && (cleanAptId.includes(cleanPid) || cleanPid.includes(cleanAptId))) {
                  return true;
                }
                
                return false;
              });
              
              return matches;
            });
            
            console.log(`Filtered to ${appointmentsData.length} appointments for doctor's ${consultedPatientIds.length} patients`);
            
            // If filtering resulted in too few records, show all as fallback
            if (appointmentsData.length === 0 && originalAppointmentsCount > 0) {
              console.warn('Doctor filtering resulted in 0 appointments but we had appointments before. Showing all appointments as fallback.');
              // Re-fetch all appointments
              const allAppointmentsResponse = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
                params: { limit: 50 },
                timeout: 30000
              });
              appointmentsData = allAppointmentsResponse.data || [];
              
              // Re-populate patient names
              appointmentsData = appointmentsData.map((appointment: AppointmentItem) => {
                if (!appointment.patientName || appointment.patientName === 'Unknown Patient') {
                  const appointmentPatientId = (appointment.patientId || '').toLowerCase().trim();
                  let patientName = patientsMap.get(appointmentPatientId);
                  if (!patientName) {
                    patientName = patientsMap.get(`patient/${appointmentPatientId}`);
                  }
                  if (!patientName) {
                    const cleanId = appointmentPatientId.replace(/^patient\//, '').replace(/^Patient\//, '');
                    patientName = patientsMap.get(cleanId);
                  }
                  if (!patientName) {
                    for (const [pid, pname] of patientsMap.entries()) {
                      if (appointmentPatientId.includes(pid) || pid.includes(appointmentPatientId)) {
                        patientName = pname;
                        break;
                      }
                    }
                  }
                  if (patientName) {
                    return { ...appointment, patientName: patientName };
                  }
                }
                return appointment;
              });
            }
          } else {
            // Fallback: show all appointments if no matches found
            console.log('No patients found for this doctor from visits. Showing all appointments as fallback.');
          }
        } catch (visitsError) {
          console.error('Error filtering appointments for doctor:', visitsError);
          // Fallback: show all appointments if filtering fails
        }
      } else if (user?.role === 'patient') {
        // For patients, filter by their own patient ID
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.username === user.username);
        
        const userPatientId = (currentUser?.patientId || user.patientId || '').toLowerCase().trim();
        const userFirstName = (currentUser?.firstName || '').toLowerCase().trim();
        const userLastName = (currentUser?.lastName || '').toLowerCase().trim();
        const userFullName = `${userFirstName} ${userLastName}`.trim();
        
        if (userPatientId || userFullName) {
          appointmentsData = appointmentsData.filter((apt: AppointmentItem) => {
            // Match by patient ID
            if (userPatientId && apt.patientId && !userPatientId.startsWith('pat')) {
              const aptId = apt.patientId.toLowerCase().trim();
              if (aptId === userPatientId || aptId.includes(userPatientId) || userPatientId.includes(aptId)) {
                return true;
              }
            }
            
            // Match by patient name
            if (userFullName && apt.patientName) {
              const aptName = apt.patientName.toLowerCase().trim();
              if (aptName.includes(userFullName) || userFullName.includes(aptName)) {
                return true;
              }
            }
            
            return false;
          });
        }
      }
      
      // Show ALL appointments (past, today, and future) - no filtering by date
      // We'll just mark which ones are today's appointments for highlighting
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Mark today's appointments and sort (today's first, then by date)
      appointmentsData = appointmentsData.map((apt: AppointmentItem) => {
        let isToday = false;
        
        if (apt.startDate) {
          const aptDate = new Date(apt.startDate);
          aptDate.setHours(0, 0, 0, 0);
          isToday = aptDate.getTime() === today.getTime();
        } else if (apt.startTime) {
          try {
            const timestamp = new Date(apt.startTime);
            if (!isNaN(timestamp.getTime())) {
              const timestampDate = new Date(timestamp);
              timestampDate.setHours(0, 0, 0, 0);
              isToday = timestampDate.getTime() === today.getTime();
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        return { ...apt, isToday };
      });
      
      // Sort by date (today's first, then soonest first)
      appointmentsData.sort((a: any, b: any) => {
        // Today's appointments first
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        
        // Then sort by date
        const dateA = new Date(a.startDate || a.startTime || 0);
        const dateB = new Date(b.startDate || b.startTime || 0);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Merge created appointments with API appointments
      // Convert created appointments to AppointmentItem format
      const formattedCreatedAppointments: AppointmentItem[] = patientCreatedAppointments.map((apt: any) => ({
        id: apt.id,
        patientId: apt.patientId,
        patientName: apt.patientName,
        hospitalId: apt.hospitalId,
        hospitalName: apt.hospitalName,
        encounterType: apt.encounterType,
        status: apt.status || 'planned',
        startDate: apt.startDate,
        startTime: apt.startTime,
        reason: apt.reason,
        location: apt.hospitalName
      }));

      // Combine and remove duplicates
      const allAppointments = [...formattedCreatedAppointments];
      appointmentsData.forEach((apiApt: AppointmentItem) => {
        // Check if appointment already exists (by ID or date+time+patient)
        const exists = allAppointments.some(createdApt => 
          createdApt.id === apiApt.id ||
          (createdApt.startDate === apiApt.startDate && 
           createdApt.startTime === apiApt.startTime &&
           createdApt.patientId === apiApt.patientId)
        );
        if (!exists) {
          allAppointments.push(apiApt);
        }
      });

      // Sort all appointments by date
      allAppointments.sort((a: any, b: any) => {
        // Today's appointments first
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        
        // Then sort by date
        const dateA = new Date(a.startDate || a.startTime || 0);
        const dateB = new Date(b.startDate || b.startTime || 0);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAppointments(allAppointments);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      if (axios.isCancel(err)) {
        setError('Request cancelled.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching appointments. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('Appointments endpoint not found. Ensure backend is running and configured correctly.');
      } else {
        setError(err.message || 'Failed to fetch appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view appointments.</div>
      </div>
    );
  }

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus !== 'all' && apt.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  const uniqueStatuses = Array.from(new Set(appointments.map(apt => apt.status)));

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM format
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'planned') return '#3b82f6'; // blue
    if (statusLower === 'arrived') return '#10b981'; // green
    if (statusLower === 'in-progress') return '#f59e0b'; // amber
    if (statusLower === 'finished') return '#6b7280'; // gray
    if (statusLower === 'cancelled') return '#ef4444'; // red
    return '#6b7280'; // default gray
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
            📅 Appointments {user.role === 'doctor' ? '(My Appointments)' : '(Your Appointments)'}
          </h2>
        </div>
        <div className="loading">Loading appointments...</div>
      </div>
    );
  }

  // Get patient info for create modal
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const currentUser = registeredUsers.find((u: any) => u.username === user?.username);
  const patientId = currentUser?.patientId || user?.patientId;
  const patientName = currentUser 
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() 
    : user?.name;

  const handleAppointmentTypeSelect = (type: string) => {
    // Check if hospital is selected
    if (!selectedHospitalId) {
      alert('Please select a hospital first before choosing an appointment type.');
      return;
    }
    setSelectedAppointmentType(type);
    // Open the create modal with the selected type
    setShowCreateModal(true);
  };

  return (
    <div className="data-list">
      {/* Schedule an Appointment Interface - Show for patients */}
      {user?.role === 'patient' && (showScheduleInterface || filteredAppointments.length === 0) && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 20px 0',
            color: '#1a1a1a'
          }}>
            Schedule an Appointment
          </h1>

          {/* Hospital Selection Dropdown */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <label htmlFor="hospital-select" style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '10px'
            }}>
              Select Hospital
            </label>
            <select
              id="hospital-select"
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              disabled={loadingHospitals}
              style={{
                width: '100%',
                padding: '12px 15px',
                fontSize: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: '#fff',
                color: '#1a1a1a',
                cursor: loadingHospitals ? 'not-allowed' : 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23374151\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 15px center',
                paddingRight: '40px'
              }}
            >
              <option value="">
                {loadingHospitals ? 'Loading hospitals...' : '-- Select a hospital --'}
              </option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
            {hospitals.length === 0 && !loadingHospitals && (
              <p style={{
                margin: '10px 0 0 0',
                fontSize: '0.85rem',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                No hospitals available. Please contact support.
              </p>
            )}
          </div>

          {/* Maryland Hospital Outpatient Facility Fee Disclosure */}
          <div style={{
            marginBottom: '30px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#fff'
          }}>
            <button
              onClick={() => setShowFeeDisclosure(!showFeeDisclosure)}
              style={{
                width: '100%',
                padding: '15px 20px',
                background: '#fff',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.95rem',
                color: '#374151',
                fontWeight: '500',
                borderRadius: '8px'
              }}
            >
              <span>Maryland Hospital Outpatient Facility Fee Disclosure</span>
              <span style={{
                fontSize: '0.9rem',
                transition: 'transform 0.3s',
                transform: showFeeDisclosure ? 'rotate(180deg)' : 'rotate(0deg)',
                color: '#6b7280',
                marginLeft: '10px'
              }}>
                ▼
              </span>
            </button>
            {showFeeDisclosure && (
              <div style={{
                padding: '20px',
                background: '#fff',
                borderTop: '1px solid #e5e7eb',
                fontSize: '0.9rem',
                color: '#4b5563',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  Outpatient facility fees are separate charges from your physician&apos;s fees. These fees cover the use of the hospital&apos;s facilities, equipment, and support staff.
                </p>
                <p style={{ margin: '0 0 10px 0' }}>
                  The facility fee may vary based on the type of service provided. Please contact your insurance provider to understand your coverage for outpatient facility fees.
                </p>
                <p style={{ margin: 0 }}>
                  For questions about facility fees, please contact our billing department at (555) 123-4567.
                </p>
              </div>
            )}
          </div>

          {/* Tell us why you're coming in */}
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            margin: '0 0 25px 0',
            color: '#1a1a1a',
            textAlign: 'center'
          }}>
            Tell us why you're coming in
          </h2>

          {/* Appointment Type Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Other */}
            <button
              onClick={() => handleAppointmentTypeSelect('other')}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <span style={{ fontSize: '2rem' }}>🩺</span>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '5px' }}>
                    Other
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Send a request to our scheduling staff
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>→</span>
            </button>

            {/* Primary Care */}
            <button
              onClick={() => handleAppointmentTypeSelect('primary-care')}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <span style={{ fontSize: '2rem' }}>🤲</span>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '5px' }}>
                    Primary Care
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Includes adult, pediatric, and geriatric care
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>→</span>
            </button>

            {/* Specialty Care and Services */}
            <button
              onClick={() => handleAppointmentTypeSelect('specialty-care')}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <span style={{ fontSize: '2rem' }}>🏥</span>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '5px' }}>
                    Specialty Care and Services
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Schedule an appointment with select specialty care providers
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>→</span>
            </button>

            {/* All options */}
            <button
              onClick={() => handleAppointmentTypeSelect('all-options')}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <span style={{ fontSize: '2rem' }}>🏥</span>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '5px' }}>
                    All options
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    List of specialties and services available
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Existing Appointments Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div className="user-header" style={{ 
          padding: '15px',
          background: '#E3F2FD',
          borderRadius: '8px',
          flex: 1
        }}>
          <h2 style={{ margin: 0 }}>
            📅 {user?.role === 'patient' ? 'Your Appointments' : 'My Appointments'} ({filteredAppointments.length})
          </h2>
        </div>
        {user?.role === 'patient' && (
          <button
            type="button"
            onClick={() => setShowScheduleInterface(!showScheduleInterface)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: showScheduleInterface ? '#6b7280' : '#6366f1',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              width: 'fit-content',
              minWidth: 'fit-content',
              whiteSpace: 'nowrap'
            }}
          >
            {showScheduleInterface ? 'Hide Schedule' : '+ Schedule an Appointment'}
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px',
          whiteSpace: 'pre-line'
        }}>
          ⚠️ {error}
        </div>
      )}

      {!error && appointments.length === 0 && (
        <div className="empty-state" style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          background: '#f9fafb',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📅</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>No Appointments Found</h3>
          <p style={{ margin: 0, color: '#666' }}>
            {user.role === 'doctor' 
              ? 'You don\'t have any upcoming appointments scheduled.'
              : 'You don\'t have any upcoming appointments scheduled.'}
          </p>
        </div>
      )}

      {!error && appointments.length > 0 && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: filterStatus === 'all' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                background: filterStatus === 'all' ? '#6366f1' : 'white',
                color: filterStatus === 'all' ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: filterStatus === 'all' ? '600' : '400'
              }}
            >
              All ({appointments.length})
            </button>
            {uniqueStatuses.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: filterStatus === status ? `2px solid ${getStatusColor(status)}` : '1px solid #e5e7eb',
                  background: filterStatus === status ? getStatusColor(status) : 'white',
                  color: filterStatus === status ? 'white' : '#666',
                  cursor: 'pointer',
                  fontWeight: filterStatus === status ? '600' : '400'
                }}
              >
                {status} ({appointments.filter(a => a.status === status).length})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredAppointments.map((appointment: any) => {
              const isTodayAppointment = appointment.isToday;
              return (
                <div
                  key={appointment.id}
                style={{
                  background: isTodayAppointment ? '#fff7ed' : 'white',
                  border: isTodayAppointment ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  transition: 'all 0.2s ease',
                  boxShadow: isTodayAppointment ? '0 2px 8px rgba(245, 158, 11, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {appointment.patientName ? (
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a', fontWeight: 'bold' }}>
                          {appointment.patientName}
                        </h3>
                      ) : (
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#666', fontWeight: 'normal' }}>
                          Patient ID: {appointment.patientId || 'N/A'}
                        </h3>
                      )}
                      {isTodayAppointment && (
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: '#f59e0b',
                            color: 'white'
                          }}
                        >
                          Today
                        </span>
                      )}
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: getStatusColor(appointment.status),
                          color: 'white'
                        }}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <strong>Type:</strong> {appointment.encounterType}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      <strong>Date:</strong> {formatDate(appointment.startDate)}
                      {appointment.startTime && ` at ${formatTime(appointment.startTime)}`}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {appointment.hospitalName && (
                    <div>
                      <strong>Hospital:</strong> {appointment.hospitalName}
                    </div>
                  )}
                  {appointment.location && (
                    <div>
                      <strong>Location:</strong> {appointment.location}
                    </div>
                  )}
                  {appointment.reason && (
                    <div>
                      <strong>Reason:</strong> {appointment.reason}
                    </div>
                  )}
                  {appointment.endTime && (
                    <div>
                      <strong>End Time:</strong> {formatTime(appointment.endTime)}
                    </div>
                  )}
                  {appointment.durationMinutes && (
                    <div>
                      <strong>Duration:</strong> {Math.floor(appointment.durationMinutes / 60)}h {appointment.durationMinutes % 60}m
                    </div>
                  )}
                  {appointment.participants && appointment.participants.length > 0 && (
                    <div>
                      <strong>Participants:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {appointment.participants.map((p, idx) => (
                          <li key={idx}>{p.type}: {p.reference || p.name || 'N/A'}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create Appointment Modal */}
      {showCreateModal && user?.role === 'patient' && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedAppointmentType(null);
            setShowScheduleInterface(false);
          }}
          onAppointmentCreated={() => {
            fetchAppointments(); // Refresh appointments after creation
            setShowCreateModal(false); // Close modal after successful creation
            setSelectedAppointmentType(null);
            setShowScheduleInterface(false);
            setSelectedHospitalId(''); // Reset hospital selection
          }}
          patientId={patientId}
          patientName={patientName}
          appointmentType={selectedAppointmentType}
          preselectedHospitalId={selectedHospitalId}
        />
      )}
    </div>
  );
}

