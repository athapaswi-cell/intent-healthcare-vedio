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
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  insuranceProvider: string;
  claimType: string;
  totalAmount: number;
  submissionDate: string;
  status: string;
}

interface ProviderStats {
  hospitalId: string;
  hospitalName: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  totalClaimAmount: number;
  lastPolicyDate: string;
  lastClaimDate: string;
}

export default function Providers() {
  const [providers, setProviders] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hospitals
      const hospitalsResponse = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 10000
      });
      const hospitals = hospitalsResponse.data || [];

      // Fetch real policies from FHIR
      let allPolicies: InsurancePolicy[] = [];
      try {
        const policiesResponse = await axios.get(`${API_BASE_URL}/api/v1/insurance/policies`, {
          timeout: 15000
        });
        const fhirPolicies = policiesResponse.data || [];
        allPolicies = fhirPolicies.map((policy: any) => ({
          id: policy.id || policy.coverageId || '',
          policyNumber: policy.policyNumber || policy.coverageId || policy.id || 'N/A',
          hospitalId: policy.hospitalId || policy.organizationId || '',
          hospitalName: policy.hospitalName || policy.organizationName || 'Unknown Hospital',
          provider: policy.provider || policy.payor || 'Unknown',
          policyType: policy.policyType || 'Health Insurance',
          coverageType: policy.coverageType || 'In-Network',
          status: policy.status || 'Active',
          effectiveDate: policy.effectiveDate || policy.periodStart || new Date().toISOString().split('T')[0],
          expiryDate: policy.expiryDate || policy.periodEnd || new Date().toISOString().split('T')[0]
        }));
      } catch (policiesError) {
        console.warn('Could not fetch policies from FHIR:', policiesError);
        // Don't generate mock data - just use empty array
        allPolicies = [];
      }

      // Fetch or generate claims
      let allClaims: InsuranceClaim[] = [];
      try {
        const claimsResponse = await axios.get(`${API_BASE_URL}/api/v1/insurance/claims`, {
          timeout: 10000
        });
        allClaims = (claimsResponse.data || []).map((claim: any) => ({
          id: claim.id || claim.claimNumber,
          claimNumber: claim.claimNumber || claim.id,
          hospitalId: claim.hospitalId || claim.hospital?.id || '',
          hospitalName: claim.hospitalName || claim.hospital?.name || 'Unknown Hospital',
          patientName: claim.patientName || 'Unknown Patient',
          insuranceProvider: claim.insuranceProvider || claim.provider || 'Unknown',
          claimType: claim.claimType || claim.type || 'General',
          totalAmount: typeof claim.totalAmount === 'number' ? claim.totalAmount : parseFloat(claim.totalAmount?.replace(/[^0-9.]/g, '') || '0'),
          submissionDate: claim.submissionDate || claim.date || new Date().toISOString(),
          status: claim.status || 'Pending'
        }));
      } catch (claimsError) {
        console.warn('Could not fetch claims from FHIR:', claimsError);
        // Don't generate mock data - just use empty array
        allClaims = [];
      }

      // Load claims from localStorage
      try {
        const createdClaims = JSON.parse(localStorage.getItem('createdClaims') || '[]');
        createdClaims.forEach((claim: any) => {
          allClaims.push({
            id: claim.id || claim.claimNumber,
            claimNumber: claim.claimNumber || claim.id,
            hospitalId: claim.hospitalId || '',
            hospitalName: claim.hospitalName || 'Unknown Hospital',
            patientName: claim.patientName || 'Unknown Patient',
            insuranceProvider: claim.insuranceProvider || 'Unknown',
            claimType: claim.claimType || 'General',
            totalAmount: typeof claim.totalAmount === 'number' ? claim.totalAmount : parseFloat(String(claim.totalAmount || '0').replace(/[^0-9.]/g, '')),
            submissionDate: claim.submissionDate || new Date().toISOString(),
            status: claim.status || 'Pending'
          });
        });
      } catch (e) {
        console.warn('Could not load claims from localStorage:', e);
      }

      // Aggregate statistics by hospital
      const providerMap = new Map<string, ProviderStats>();

      // Initialize all hospitals as providers
      hospitals.forEach((hospital: Hospital) => {
        providerMap.set(hospital.id, {
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          address: hospital.address || '',
          city: hospital.city || '',
          state: hospital.state || '',
          phone: hospital.phone,
          totalPolicies: 0,
          activePolicies: 0,
          totalClaims: 0,
          totalClaimAmount: 0,
          lastPolicyDate: '',
          lastClaimDate: ''
        });
      });

      // Process policies
      allPolicies.forEach((policy) => {
        const provider = providerMap.get(policy.hospitalId);
        if (provider) {
          provider.totalPolicies++;
          if (policy.status === 'Active') {
            provider.activePolicies++;
          }
          if (!provider.lastPolicyDate || new Date(policy.effectiveDate) > new Date(provider.lastPolicyDate)) {
            provider.lastPolicyDate = policy.effectiveDate;
          }
        }
      });

      // Process claims
      allClaims.forEach((claim) => {
        const provider = providerMap.get(claim.hospitalId);
        if (provider) {
          provider.totalClaims++;
          provider.totalClaimAmount += claim.totalAmount;
          if (!provider.lastClaimDate || new Date(claim.submissionDate) > new Date(provider.lastClaimDate)) {
            provider.lastClaimDate = claim.submissionDate;
          }
        }
      });

      const providersList = Array.from(providerMap.values())
        .filter(p => p.totalPolicies > 0 || p.totalClaims > 0) // Only show providers with policies or claims
        .sort((a, b) => {
          // Sort by total policies + claims (most active first)
          const aScore = a.totalPolicies + a.totalClaims;
          const bScore = b.totalPolicies + b.totalClaims;
          return bScore - aScore;
        });

      setProviders(providersList);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching providers:', err);
      setError('Failed to fetch providers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        provider.hospitalName.toLowerCase().includes(searchLower) ||
        provider.city.toLowerCase().includes(searchLower) ||
        provider.state.toLowerCase().includes(searchLower) ||
        provider.hospitalId.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="data-list">
        <div className="loading">Loading providers...</div>
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
          🏥 Providers ({filteredProviders.length})
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
          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search by hospital name, city, state, or ID..."
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

          {/* Providers List */}
          {filteredProviders.length === 0 ? (
            <div className="empty-state" style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              background: '#f9fafb',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏥</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>No Providers Found</h3>
              <p style={{ margin: 0, color: '#666' }}>
                {searchTerm ? 'Try adjusting your search' : 'No providers available'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
              {filteredProviders.map((provider) => (
                <div
                  key={provider.hospitalId}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1a1a1a', fontWeight: 'bold' }}>
                    {provider.hospitalName}
                  </h3>
                  
                  <div style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
                    <p style={{ margin: '4px 0' }}>
                      📍 {provider.address}, {provider.city}, {provider.state}
                    </p>
                    {provider.phone && (
                      <p style={{ margin: '4px 0' }}>
                        📞 {provider.phone}
                      </p>
                    )}
                    <p style={{ margin: '4px 0' }}>
                      🆔 ID: {provider.hospitalId}
                    </p>
                  </div>

                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '20px', 
                    borderTop: '1px solid #e5e7eb',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
                        {provider.totalPolicies}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                        Total Policies
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                        {provider.activePolicies} Active
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        {provider.totalClaims}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                        Total Claims
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '4px' }}>
                        {formatCurrency(provider.totalClaimAmount)}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '15px', 
                    paddingTop: '15px', 
                    borderTop: '1px solid #e5e7eb',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Last Policy:</strong> {formatDate(provider.lastPolicyDate)}
                    </div>
                    <div>
                      <strong>Last Claim:</strong> {formatDate(provider.lastClaimDate)}
                    </div>
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

