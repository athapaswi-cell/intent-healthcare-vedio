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
  patientId?: string;
  patientName?: string;
}

interface Policyholder {
  patientId: string;
  patientName: string;
  email?: string;
  phone?: string;
  policies: InsurancePolicy[];
  totalPolicies: number;
  activePolicies: number;
  primaryProvider: string;
  lastPolicyDate: string;
}

export default function Policyholders() {
  const [policyholders, setPolicyholders] = useState<Policyholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchPolicyholders();
  }, []);

  const fetchPolicyholders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hospitals
      const hospitalsResponse = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 10000
      });
      const hospitals = hospitalsResponse.data || [];

      // Fetch patients to get names
      let patientsMap = new Map<string, { name: string; email?: string; phone?: string }>();
      try {
        const patientsResponse = await axios.get(`${API_BASE_URL}/api/v1/patients/`, {
          timeout: 10000
        });
        const patients = patientsResponse.data || [];
        
        patients.forEach((patient: any) => {
          const patientId = patient.id;
          const firstName = patient.first_name || '';
          const lastName = patient.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          if (patientId && fullName) {
            patientsMap.set(patientId.toLowerCase(), {
              name: fullName,
              email: patient.email,
              phone: patient.phone
            });
          }
        });
      } catch (patientsError) {
        console.warn('Could not fetch patients:', patientsError);
      }

      // Generate policies for each hospital (similar to InsurancePolicies)
      const allPolicies: InsurancePolicy[] = [];
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

      hospitals.forEach((hospital: Hospital, index: number) => {
        const policyCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < policyCount; i++) {
          const policyId = `POL-${hospital.id}-${i + 1}`;
          const policyNumber = `POL${String(hospital.id).padStart(4, '0')}${String(i + 1).padStart(3, '0')}`;
          
          const effectiveDate = new Date();
          effectiveDate.setMonth(effectiveDate.getMonth() - Math.floor(Math.random() * 12));
          
          const expiryDate = new Date(effectiveDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          
          // Generate a patient ID for this policy
          const patientIndex = (index * policyCount + i) % Math.max(patientsMap.size, 10);
          const patientIds = Array.from(patientsMap.keys());
          const patientId = patientIds[patientIndex] || `PAT${String(patientIndex + 1).padStart(3, '0')}`;
          const patientInfo = patientsMap.get(patientId) || { name: `Patient ${patientIndex + 1}` };

          allPolicies.push({
            id: policyId,
            policyNumber,
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            provider: INSURANCE_PROVIDERS[Math.floor(Math.random() * INSURANCE_PROVIDERS.length)],
            policyType: 'Health Insurance',
            coverageType: ['In-Network', 'Out-of-Network', 'Both'][Math.floor(Math.random() * 3)],
            status: ['Active', 'Pending', 'Expired'][Math.floor(Math.random() * 3)],
            effectiveDate: effectiveDate.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            coverageLimit: `$${(Math.random() * 500000 + 100000).toFixed(0)}`,
            deductible: `$${(Math.random() * 5000 + 500).toFixed(0)}`,
            coPay: `$${(Math.random() * 100 + 20).toFixed(0)}`,
            patientId: patientId,
            patientName: patientInfo.name
          });
        }
      });

      // Group policies by patient (policyholder)
      const policyholderMap = new Map<string, Policyholder>();

      allPolicies.forEach((policy) => {
        if (!policy.patientId) return;

        const patientId = policy.patientId.toLowerCase();
        const patientInfo = patientsMap.get(patientId) || { name: policy.patientName || 'Unknown Patient' };

        if (!policyholderMap.has(patientId)) {
          policyholderMap.set(patientId, {
            patientId: patientId,
            patientName: patientInfo.name || policy.patientName || 'Unknown Patient',
            email: patientInfo.email,
            phone: patientInfo.phone,
            policies: [],
            totalPolicies: 0,
            activePolicies: 0,
            primaryProvider: policy.provider,
            lastPolicyDate: policy.effectiveDate
          });
        }

        const policyholder = policyholderMap.get(patientId)!;
        policyholder.policies.push(policy);
        policyholder.totalPolicies++;
        if (policy.status === 'Active') {
          policyholder.activePolicies++;
        }
        
        // Update primary provider (most common)
        const providerCounts = new Map<string, number>();
        policyholder.policies.forEach(p => {
          providerCounts.set(p.provider, (providerCounts.get(p.provider) || 0) + 1);
        });
        let maxCount = 0;
        providerCounts.forEach((count, provider) => {
          if (count > maxCount) {
            maxCount = count;
            policyholder.primaryProvider = provider;
          }
        });

        // Update last policy date
        if (new Date(policy.effectiveDate) > new Date(policyholder.lastPolicyDate)) {
          policyholder.lastPolicyDate = policy.effectiveDate;
        }
      });

      const policyholdersList = Array.from(policyholderMap.values());
      setPolicyholders(policyholdersList);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching policyholders:', err);
      setError('Failed to fetch policyholders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter policyholders
  const filteredPolicyholders = policyholders.filter(holder => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!holder.patientName.toLowerCase().includes(searchLower) &&
          !holder.patientId.toLowerCase().includes(searchLower) &&
          !(holder.email && holder.email.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Provider filter
    if (filterProvider !== 'all') {
      const hasMatchingProvider = holder.policies.some(p => p.provider === filterProvider);
      if (!hasMatchingProvider) return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && holder.activePolicies === 0) return false;
      if (filterStatus === 'inactive' && holder.activePolicies > 0) return false;
    }

    return true;
  });

  const uniqueProviders = Array.from(new Set(policyholders.flatMap(h => h.policies.map(p => p.provider))));

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="data-list">
        <div className="loading">Loading policyholders...</div>
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
          👥 Policyholders ({filteredPolicyholders.length})
        </h2>
      </div>

      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {!error && (
        <>
          {/* Filters */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            >
              <option value="all">All Providers</option>
              {uniqueProviders.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Policies</option>
              <option value="inactive">No Active Policies</option>
            </select>
          </div>

          {/* Policyholders List */}
          {filteredPolicyholders.length === 0 ? (
            <div className="empty-state" style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              background: '#f9fafb',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👥</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>No Policyholders Found</h3>
              <p style={{ margin: 0, color: '#666' }}>
                {searchTerm || filterProvider !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No policyholders available'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredPolicyholders.map((holder) => (
                <div
                  key={holder.patientId}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a1a', fontWeight: 'bold' }}>
                        {holder.patientName}
                      </h3>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                        Patient ID: {holder.patientId}
                      </p>
                      {holder.email && (
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                          📧 {holder.email}
                        </p>
                      )}
                      {holder.phone && (
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                          📞 {holder.phone}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        padding: '6px 12px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        background: holder.activePolicies > 0 ? '#10b981' : '#6b7280',
                        color: 'white',
                        marginBottom: '8px'
                      }}>
                        {holder.activePolicies} Active
                      </div>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}>
                        {holder.totalPolicies} Total Policies
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '15px', 
                    paddingTop: '15px', 
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Primary Provider:</strong> {holder.primaryProvider}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Last Policy Date:</strong> {formatDate(holder.lastPolicyDate)}
                    </div>
                    
                    <details style={{ marginTop: '10px' }}>
                      <summary style={{ cursor: 'pointer', color: '#6366f1', fontWeight: '500' }}>
                        View All Policies ({holder.policies.length})
                      </summary>
                      <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {holder.policies.map((policy) => (
                          <div
                            key={policy.id}
                            style={{
                              padding: '12px',
                              background: '#f9fafb',
                              borderRadius: '6px',
                              borderLeft: '3px solid #6366f1'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong>{policy.policyNumber}</strong> - {policy.provider}
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                  {policy.hospitalName} • {policy.policyType}
                                </div>
                              </div>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: policy.status === 'Active' ? '#10b981' : policy.status === 'Pending' ? '#f59e0b' : '#6b7280',
                                color: 'white'
                              }}>
                                {policy.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                              Effective: {formatDate(policy.effectiveDate)} • Expires: {formatDate(policy.expiryDate)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

