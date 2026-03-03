import React, { useState } from 'react';
import './Dashboard.css';
import './InsuranceAgentDashboard.css';

interface AppUser {
  username: string;
  role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';
  email?: string;
  name?: string;
}

interface InsuranceAgentDashboardProps {
  user: AppUser | null;
  onNavigate?: (section: string, subItem?: string) => void;
}

export default function InsuranceAgentDashboard({ user, onNavigate }: InsuranceAgentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user's display name
  const displayName = user?.name || user?.username || 'Insurance Agent';
  const firstName = displayName.split(' ')[0];

  // Sample data - in real app, this would come from API
  const policyholdersData = {
    activeCount: 482,
    activeClaims: 25,
    pendingDocuments: 3,
    activeAppointments: 25,
    pendingMessages: 'Pending'
  };

  const scheduledDoctor = {
    name: 'Edward Parker',
    date: '5/08/2024',
    image: '👨‍⚕️'
  };

  const claims = [
    {
      id: 1,
      name: 'Edward Miller',
      type: 'Emergency Room Visit',
      date: '2/22, 2024',
      status: 'Under Review',
      statusDate: '4/22/2024',
      image: '👨'
    },
    {
      id: 2,
      name: 'Jessica Lee',
      type: 'Surgery, finalized',
      status: 'Awaiting Documents',
      statusDate: '4/16/2024',
      image: '👩'
    }
  ];

  const providers = [
    {
      id: 1,
      name: 'Memorial Hospital',
      address: '123 Main St., Anytown, USA',
      icon: '🏥'
    },
    {
      id: 2,
      name: 'Central Medical Center',
      address: '456 Central Ave, Anytown, USA',
      icon: '🏥'
    }
  ];

  const monthlyClaimsData = [
    { month: 'Nov', value: 35 },
    { month: 'Dec', value: 40 },
    { month: 'Jan', value: 50 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 48 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 60 }
  ];

  const maxValue = 60; // Fixed max value for consistent scaling

  return (
    <div className="insurance-agent-dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome back, {firstName}! 👋</h1>
        <p>Here's what's happening with your policyholders today.</p>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Policyholders Section */}
          <section className="dashboard-section policyholders-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">🌳</span>
                Policyholders
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('policyholders'); }}>
                View All &gt;
              </a>
            </div>

            {/* Key Metrics Bar */}
            <div className="metrics-bar">
              <div className="metric-main">
                <strong>{policyholdersData.activeCount} Active Policyholders</strong>
              </div>
              <div className="metric-icon">📁 <span>{policyholdersData.activeClaims}</span></div>
              <div className="metric-icon">📁 <span>{policyholdersData.pendingDocuments}</span></div>
            </div>

            {/* Cards Grid */}
            <div className="policyholders-cards">
              <div className="policyholder-card">
                <div className="card-icon">✓</div>
                <div className="card-content">
                  <div className="card-label">Active Claims</div>
                  <div className="card-label">Active Appointments</div>
                  <div className="card-value">{policyholdersData.activeAppointments}</div>
                </div>
              </div>

              <div className="policyholder-card">
                <div className="card-icon-envelope">✉</div>
                <div className="card-content">
                  <div className="card-label">Pending Messages</div>
                  <div className="card-status">{policyholdersData.pendingMessages}</div>
                </div>
              </div>
            </div>

            {/* Search and Schedule Doctor Section - Below Active Policyholders */}
            <div className="search-schedule-section">
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Enghin"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="schedule-search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <div className="schedule-doctor">
                <div className="schedule-doctor-header">Schedule Doctor</div>
                <div className="schedule-doctor-info">
                  <div className="doctor-avatar-small">{scheduledDoctor.image}</div>
                  <div className="doctor-details">
                    <div className="doctor-name">{scheduledDoctor.name}</div>
                    <div className="doctor-date">{scheduledDoctor.date}</div>
                  </div>
                  <div className="doctor-avatar-small">{scheduledDoctor.image}</div>
                  <div className="arrow-icon">→</div>
                </div>
              </div>
            </div>
          </section>

          {/* Claims Section */}
          <section className="dashboard-section claims-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">📍</span>
                Claims
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('insurance'); }}>
                View All &gt;
              </a>
            </div>

            <div className="claims-list">
              {claims.map((claim) => (
                <div key={claim.id} className="claim-item">
                  <div className="claim-avatar">{claim.image}</div>
                  <div className="claim-info">
                    <div className="claim-name">{claim.name}</div>
                    <div className="claim-type">{claim.type}</div>
                    {claim.date && <div className="claim-date">{claim.date}</div>}
                  </div>
                  <div className="claim-status">
                    <span className={`status-tag ${claim.status.toLowerCase().replace(' ', '-')}`}>
                      {claim.status}
                    </span>
                    <div className="claim-status-date">{claim.statusDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Providers Section */}
          <section className="dashboard-section providers-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">🏢</span>
                Providers
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('providers'); }}>
                View All &gt;
              </a>
            </div>

            <div className="providers-list">
              {providers.map((provider) => (
                <div key={provider.id} className="provider-item">
                  <div className="provider-icon">{provider.icon}</div>
                  <div className="provider-info">
                    <div className="provider-name">{provider.name}</div>
                    <div className="provider-address">{provider.address}</div>
                  </div>
                  <div className="arrow-icon">→</div>
                </div>
              ))}
            </div>
          </section>

          {/* Add New Claim Section */}
          <section className="dashboard-section add-claim-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">📝</span>
                Claims Actions
              </h2>
            </div>
            <button className="btn-add-claim" onClick={() => onNavigate?.('insurance', 'insurance-claims')}>
              + Add New Claim
            </button>
          </section>

          {/* Monthly Claims Chart */}
          <section className="dashboard-section chart-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">📊</span>
                Monthly Claims
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('insurance'); }}>
                View All &gt;
              </a>
            </div>

            <div className="chart-container">
              <div className="chart-y-axis">
                <div className="y-label">60</div>
                <div className="y-label">30</div>
                <div className="y-label">0</div>
              </div>
              <div className="chart-bars">
                {monthlyClaimsData.map((data, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{ height: `${(data.value / maxValue) * 100}%` }}
                      >
                        <span className="bar-value">{data.value}</span>
                      </div>
                    </div>
                    <div className="chart-x-label">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

