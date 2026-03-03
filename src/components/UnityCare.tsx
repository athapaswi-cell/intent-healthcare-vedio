import React from 'react';
import './UnityCare.css';

export default function UnityCare() {
  return (
    <div className="unity-care-container">
      <div className="unity-care-header">
        <h1>🤝 Unity Care</h1>
        <p className="unity-care-subtitle">Comprehensive Healthcare Management Platform</p>
      </div>

      <div className="unity-care-content">
        <div className="unity-care-intro">
          <h2>Welcome to Unity Care</h2>
          <p>
            Unity Care is your integrated healthcare management system designed to provide seamless 
            coordination between patients, healthcare providers, and medical facilities. Our platform 
            ensures comprehensive care delivery through advanced technology and compassionate service.
          </p>
        </div>

        <div className="unity-care-features">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <h3>Integrated Care Management</h3>
              <p>Seamless coordination between hospitals, clinics, and healthcare providers for comprehensive patient care.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Unified Medical Records</h3>
              <p>Centralized access to patient medical history, test results, and treatment plans across all care settings.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <h3>Medication Management</h3>
              <p>Track prescriptions, medication adherence, and coordinate with pharmacies for optimal medication therapy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Appointment Coordination</h3>
              <p>Schedule and manage appointments across multiple providers and facilities with real-time availability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Insurance Integration</h3>
              <p>Streamlined insurance claims processing, coverage verification, and policy management.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Secure Communication</h3>
              <p>HIPAA-compliant messaging system for secure communication between patients and healthcare providers.</p>
            </div>
          </div>
        </div>

        <div className="unity-care-mission">
          <h2>Our Mission</h2>
          <p>
            Unity Care is committed to breaking down barriers in healthcare delivery by providing 
            a unified platform that connects all stakeholders in the healthcare ecosystem. We believe 
            that better coordination leads to better outcomes, and our platform is designed to make 
            healthcare more accessible, efficient, and patient-centered.
          </p>
        </div>

        <div className="unity-care-benefits">
          <h2>Benefits</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <div>
                <h4>For Patients</h4>
                <p>Easy access to your complete medical history, test results, and care team in one place.</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <div>
                <h4>For Healthcare Providers</h4>
                <p>Comprehensive patient information at your fingertips for informed decision-making.</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <div>
                <h4>For Hospitals</h4>
                <p>Streamlined operations, better resource management, and improved patient outcomes.</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <div>
                <h4>For Insurance Companies</h4>
                <p>Efficient claims processing and better visibility into patient care for accurate coverage decisions.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="unity-care-contact">
          <h2>Get Started</h2>
          <p>
            Unity Care is designed to work seamlessly with your existing healthcare workflows. 
            For more information or support, please contact your system administrator or reach out 
            through the Help and Support section in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}

