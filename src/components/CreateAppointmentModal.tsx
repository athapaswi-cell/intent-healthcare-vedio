import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization?: string;
}

interface Hospital {
  id: string;
  name: string;
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: () => void;
  patientId?: string;
  patientName?: string;
  appointmentType?: string | null;
  preselectedHospitalId?: string;
}

const APPOINTMENT_TYPES = [
  'General Check-up',
  'Primary Care',
  'Follow-up Visit',
  'Consultation',
  'Emergency',
  'Lab Test',
  'X-Ray',
  'Surgery',
  'Therapy Session',
  'Preventive Care',
  'Specialist Consultation'
];

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  onAppointmentCreated,
  patientId,
  patientName,
  appointmentType,
  preselectedHospitalId
}: CreateAppointmentModalProps) {
  // Map appointment type selection to actual appointment types
  const getAppointmentTypeFromSelection = (type: string | null | undefined): string => {
    if (!type) return 'General Check-up';
    switch (type) {
      case 'primary-care':
        return 'Primary Care';
      case 'specialty-care':
        return 'Specialist Consultation';
      case 'all-options':
        return 'General Check-up';
      case 'other':
        return 'Consultation';
      default:
        return 'General Check-up';
    }
  };

  const [formData, setFormData] = useState({
    doctorId: '',
    hospitalId: '',
    appointmentType: getAppointmentTypeFromSelection(appointmentType),
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    reason: '',
    notes: ''
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      fetchHospitals();
      // Reset form with selected appointment type and hospital
      setFormData({
        doctorId: '',
        hospitalId: preselectedHospitalId || '',
        appointmentType: getAppointmentTypeFromSelection(appointmentType),
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        reason: '',
        notes: ''
      });
      setError(null);
    }
  }, [isOpen, appointmentType, preselectedHospitalId]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/doctors/`, {
        timeout: 10000
      });
      setDoctors(response.data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    // Validation
    if (!formData.doctorId) {
      setError('Please select a doctor');
      return;
    }
    if (!formData.hospitalId) {
      setError('Please select a hospital');
      return;
    }
    if (!formData.date) {
      setError('Please select a date');
      return;
    }
    if (!formData.time) {
      setError('Please select a time');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please enter a reason for the appointment');
      return;
    }

    setLoading(true);

    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      const selectedHospital = hospitals.find(h => h.id === formData.hospitalId);
      
      const doctorName = selectedDoctor 
        ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`
        : 'Unknown Doctor';
      const hospitalName = selectedHospital?.name || 'Unknown Hospital';

      // Create appointment object
      const newAppointment = {
        id: `apt_${Date.now()}`,
        patientId: patientId || 'PATIENT001',
        patientName: patientName || 'Patient',
        hospitalId: formData.hospitalId,
        hospitalName: hospitalName,
        doctorId: formData.doctorId,
        doctorName: doctorName,
        encounterType: formData.appointmentType,
        status: 'planned',
        startDate: formData.date,
        startTime: formData.time,
        reason: formData.reason,
        notes: formData.notes,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingAppointments = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      existingAppointments.unshift(newAppointment); // Add to beginning
      localStorage.setItem('patientAppointments', JSON.stringify(existingAppointments));

      // Send appointment confirmation email
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.patientId === patientId);
        const patientEmail = currentUser?.email || '';
        
        if (patientEmail) {
          await axios.post(`${API_BASE_URL}/api/v1/email/send-appointment-confirmation`, {
            to_email: patientEmail,
            patient_name: patientName || 'Patient',
            doctor_name: doctorName,
            appointment_date: formData.date,
            appointment_time: formData.time,
            hospital_name: hospitalName,
            appointment_type: formData.appointmentType
          });
          console.log('Appointment confirmation email sent');
        }
      } catch (emailError) {
        console.warn('Failed to send appointment confirmation email:', emailError);
        // Don't fail the appointment creation if email fails
      }

      // Call callback to refresh appointments list
      onAppointmentCreated();
      
      // Close modal
      onClose();
    } catch (err) {
      setError('Failed to create appointment. Please try again.');
      console.error('Error creating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Create New Appointment</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Doctor *
            </label>
            {loadingDoctors ? (
              <div style={{ padding: '10px', color: '#666' }}>Loading doctors...</div>
            ) : (
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                    {doctor.specialization ? ` - ${doctor.specialization}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Hospital *
            </label>
            {loadingHospitals ? (
              <div style={{ padding: '10px', color: '#666' }}>Loading hospitals...</div>
            ) : (
              <select
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map(hospital => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Appointment Type *
            </label>
            <select
              value={formData.appointmentType}
              onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              required
            >
              {APPOINTMENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Time *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Reason for Visit *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Describe the reason for your appointment"
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={2}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                background: '#6366f1',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

