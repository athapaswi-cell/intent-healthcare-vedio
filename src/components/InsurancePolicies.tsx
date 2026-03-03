import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

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

interface InsurancePolicy {
  id: string;
  policyNumber: string;
  hospitalId: string;
  hospitalName: string;
  provider: string;
  policyType: string;
  coverageType: string;
  status: string;
  effectiveDate: string;
  expiryDate: string;
  coverageLimit: string;
  deductible: string;
  coPay: string;
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

const POLICY_TYPES = [
  'Health Insurance',
  'Hospital Insurance',
  'Critical Care Insurance',
  'Emergency Coverage',
  'Comprehensive Health Plan'
];

const COVERAGE_TYPES = [
  'In-Network',
  'Out-of-Network',
  'Both',
  'Emergency Only'
];

const STATUSES = ['Active', 'Pending', 'Expired', 'Suspended'];

export default function InsurancePolicies() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchHospitalsAndPolicies();
  }, []);

  const fetchHospitalsAndPolicies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hospitals
      const hospitalsResponse = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 10000
      });
      const hospitalsData = hospitalsResponse.data || [];
      setHospitals(hospitalsData);

      // Fetch real insurance policies from FHIR
      try {
        const policiesResponse = await axios.get(`${API_BASE_URL}/api/v1/insurance/policies`, {
          timeout: 15000
        });
        const fhirPolicies = policiesResponse.data || [];
        
        // Map FHIR Coverage resources to InsurancePolicy format
        const mappedPolicies: InsurancePolicy[] = fhirPolicies.map((policy: any) => {
          // Extract hospital info
          const hospitalId = policy.hospitalId || policy.organizationId || '';
          const hospital = hospitalsData.find((h: Hospital) => h.id === hospitalId);
          const hospitalName = hospital?.name || policy.hospitalName || policy.organizationName || 'Unknown Hospital';
          
          return {
            id: policy.id || policy.coverageId || '',
            policyNumber: policy.policyNumber || policy.coverageId || policy.id || 'N/A',
            hospitalId: hospitalId,
            hospitalName: hospitalName,
            provider: policy.provider || policy.payor || policy.insurer || 'Unknown',
            policyType: policy.policyType || policy.type || 'Health Insurance',
            coverageType: policy.coverageType || 'In-Network',
            status: policy.status || 'Active',
            effectiveDate: policy.effectiveDate || policy.periodStart || new Date().toISOString().split('T')[0],
            expiryDate: policy.expiryDate || policy.periodEnd || new Date().toISOString().split('T')[0],
            coverageLimit: policy.coverageLimit || policy.benefitLimit || '$0',
            deductible: policy.deductible || '$0',
            coPay: policy.coPay || policy.copay || '$0'
          };
        });
        
        setPolicies(mappedPolicies);
      } catch (policiesError: any) {
        console.warn('Failed to fetch policies from FHIR:', policiesError);
        // If FHIR fails, show error but don't generate mock data
        setError('Failed to fetch insurance policies from FHIR server. Please check EPIC FHIR configuration.');
        setPolicies([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const providerMatch = filterProvider === 'all' || policy.provider === filterProvider;
    const statusMatch = filterStatus === 'all' || policy.status === filterStatus;
    return providerMatch && statusMatch;
  });

  const uniqueProviders = Array.from(new Set(policies.map(p => p.provider))).sort();

  if (loading) return <div className="loading">Loading insurance policies...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>🛡️ Insurance Policies ({filteredPolicies.length})</h2>
      
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
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredPolicies.length === 0 ? (
        <div className="no-data">
          <p>No policies found matching the selected filters.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredPolicies.map((policy) => (
            <div key={policy.id} className="data-card policy-card">
              <div className="policy-header">
                <h3>{policy.provider}</h3>
                <span className={`status-badge policy-status ${policy.status.toLowerCase().replace(' ', '-')}`}>
                  {policy.status}
                </span>
              </div>
              <div className="card-details">
                <p><strong>Policy Number:</strong> {policy.policyNumber}</p>
                <p><strong>Hospital:</strong> {policy.hospitalName}</p>
                <p><strong>Policy Type:</strong> {policy.policyType}</p>
                <p><strong>Coverage Type:</strong> {policy.coverageType}</p>
                <p><strong>Coverage Limit:</strong> {policy.coverageLimit}</p>
                <p><strong>Deductible:</strong> {policy.deductible}</p>
                <p><strong>Co-Pay:</strong> {policy.coPay}</p>
                <p><strong>Effective Date:</strong> {new Date(policy.effectiveDate).toLocaleDateString()}</p>
                <p><strong>Expiry Date:</strong> {new Date(policy.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


