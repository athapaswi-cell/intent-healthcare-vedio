import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';
import CreateClaimModal from './CreateClaimModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  hospital_type?: string;
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  provider: string;
  insuranceProvider: string;  // Added this
  claimType: string;
  status: string;
  submissionDate: string;
  serviceDate: string;
  serviceType: string;  // Added this
  totalAmount: string;
  coveredAmount: string;
  patientResponsibility: string;
  diagnosis: string;
  serviceDescription: string;
}

const INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'UnitedHealthcare',
  'Kaiser Permanente',
  'Humana',
  'Anthem',
  'Medicare',
  'Medicaid'
];

const CLAIM_TYPES = [
  'Medical',
  'Emergency',
  'Surgery',
  'Laboratory',
  'Radiology',
  'Pharmacy',
  'Inpatient',
  'Outpatient',
  'Preventive Care'
];

const CLAIM_STATUSES = ['Approved', 'Pending', 'Denied', 'Under Review', 'Paid', 'Rejected'];

const DIAGNOSES = [
  'General Examination',
  'Emergency Treatment',
  'Surgical Procedure',
  'Diagnostic Test',
  'Laboratory Test',
  'Radiology Scan',
  'Medication Administration',
  'Therapy Session',
  'Follow-up Care',
  'Preventive Screening'
];

const SAMPLE_PATIENT_NAMES = [
  'John Smith', 'Jane Doe', 'Robert Johnson', 'Mary Williams', 'James Brown',
  'Patricia Davis', 'Michael Miller', 'Linda Wilson', 'William Moore', 'Barbara Taylor',
  'David Anderson', 'Elizabeth Thomas', 'Richard Jackson', 'Jennifer White', 'Joseph Harris'
];

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterHospital, setFilterHospital] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchHospitalsAndClaims();
  }, []);

  const fetchHospitalsAndClaims = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hospitals first
      const hospitalsResponse = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 30000  // Increased timeout to 30 seconds for FHIR requests
      });
      const hospitalsData = hospitalsResponse.data;
      setHospitals(hospitalsData);

      // Load claims from localStorage (for newly created claims)
      const createdClaims = JSON.parse(localStorage.getItem('createdClaims') || '[]');

      // Fetch real claims from FHIR server
      try {
        const claimsResponse = await axios.get(`${API_BASE_URL}/api/v1/insurance/claims`, {
          timeout: 30000  // Increased timeout to 30 seconds for FHIR requests
        });
        const realClaims = claimsResponse.data;
        
        // Merge createdClaims and realClaims, avoiding duplicates
        const allClaims = [...createdClaims];
        realClaims.forEach((claim: InsuranceClaim) => {
          // Check if claim already exists (by claimNumber)
          if (!allClaims.find(c => c.claimNumber === claim.claimNumber)) {
            allClaims.push(claim);
          }
        });
        
        // Sort by submission date (newest first)
        allClaims.sort((a: InsuranceClaim, b: InsuranceClaim) => {
          const dateA = new Date(a.submissionDate).getTime();
          const dateB = new Date(b.submissionDate).getTime();
          return dateB - dateA;
        });
        
        setClaims(allClaims);
      } catch (claimsError: any) {
        // If claims endpoint fails, only use createdClaims (no mock data generation)
        console.warn('Failed to fetch claims from FHIR:', claimsError);
        
        if (createdClaims.length > 0) {
          createdClaims.sort((a: InsuranceClaim, b: InsuranceClaim) => {
            const dateA = new Date(a.submissionDate).getTime();
            const dateB = new Date(b.submissionDate).getTime();
            return dateB - dateA;
          });
          setClaims(createdClaims);
        } else {
          // No claims available - show empty list with error message
          setError('Failed to fetch insurance claims from FHIR server. Please check EPIC FHIR configuration.');
          setClaims([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const providerMatch = filterProvider === 'all' || claim.insuranceProvider === filterProvider;
    const statusMatch = filterStatus === 'all' || claim.status === filterStatus;
    const hospitalMatch = filterHospital === 'all' || claim.hospitalId === filterHospital;
    return providerMatch && statusMatch && hospitalMatch;
  });

  const uniqueProviders = Array.from(new Set(claims.map(c => c.insuranceProvider).filter(Boolean))).sort();
  const uniqueHospitals = Array.from(new Set(claims.map(c => ({ id: c.hospitalId, name: c.hospitalName }))))
    .filter(h => h.id && h.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) return <div className="loading">Loading insurance claims...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0 }}>🛡️ Insurance Claims ({filteredClaims.length})</h2>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            width: 'fit-content',
            minWidth: 'fit-content'
          }}
        >
          + Add New Claim
        </button>
      </div>
      
      {/* Filters */}
      <div className="policy-filters">
        <div className="filter-group">
          <label>Provider:</label>
          <select 
            value={filterProvider} 
            onChange={(e) => setFilterProvider(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Providers</option>
            {uniqueProviders.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            {CLAIM_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Hospital:</label>
          <select 
            value={filterHospital} 
            onChange={(e) => setFilterHospital(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Hospitals</option>
            {uniqueHospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="no-data">
          <p>No claims found matching the selected filters.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="data-card claim-card">
              <div className="claim-header">
                <div>
                  <h3>Claim #{claim.claimNumber}</h3>
                  <p className="claim-patient">{claim.patientName}</p>
                </div>
                <span className={`status-badge claim-status ${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {claim.status}
                </span>
              </div>
              <div className="card-details">
                <p><strong>Hospital:</strong> {claim.hospitalName}</p>
                <p><strong>Provider:</strong> {claim.insuranceProvider}</p>
                <p><strong>Service Type:</strong> {claim.serviceType}</p>
                <p><strong>Diagnosis:</strong> {claim.diagnosis}</p>
                <p><strong>Service:</strong> {claim.serviceDescription}</p>
                <div className="claim-amounts">
                  <p><strong>Total Amount:</strong> <span className="amount-total">{claim.totalAmount}</span></p>
                  <p><strong>Covered Amount:</strong> <span className="amount-covered">{claim.coveredAmount}</span></p>
                  <p><strong>Patient Responsibility:</strong> <span className="amount-patient">{claim.patientResponsibility}</span></p>
                </div>
                <p><strong>Service Date:</strong> {new Date(claim.serviceDate).toLocaleDateString()}</p>
                <p><strong>Submission Date:</strong> {new Date(claim.submissionDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateClaimModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onClaimCreated={() => {
            fetchHospitalsAndClaims(); // Refresh claims after creation
            setShowCreateModal(false); // Close modal after successful creation
          }}
          hospitals={hospitals.map(h => ({ id: h.id, name: h.name }))}
        />
      )}
    </div>
  );
}

