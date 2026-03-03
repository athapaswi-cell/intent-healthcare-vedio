import React, { useState, useMemo } from 'react';
import './Settings.css';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  route?: string;
  onClick?: () => void;
}

interface SettingsProps {
  onBack?: () => void;
  onNavigate?: (route: string) => void;
}

export default function Settings({ onBack, onNavigate }: SettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const settingsItems: SettingItem[] = [
    {
      id: 'account',
      title: 'Account',
      description: 'Manage your account information',
      icon: '👤',
      iconColor: '#3b82f6', // Light blue
      route: 'personal-info'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: '🔔',
      iconColor: '#f59e0b' // Golden/Amber
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize theme and display settings',
      icon: '👁️',
      iconColor: '#8b5cf6' // Purple
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      description: 'Manage privacy and security settings',
      icon: '🔒',
      iconColor: '#10b981' // Green
    },
    {
      id: 'help-support',
      title: 'Help and Support',
      description: 'Get help and contact support',
      icon: '🎧',
      iconColor: '#3b82f6' // Light blue
    },
    {
      id: 'about',
      title: 'About',
      description: 'View app version and information',
      icon: '❓',
      iconColor: '#6b7280' // Gray
    }
  ];

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return settingsItems;
    }
    const query = searchQuery.toLowerCase();
    return settingsItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCardClick = (item: SettingItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.route && onNavigate) {
      onNavigate(item.route);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {/* Search Bar */}
      {settingsItems.length > 0 && (
        <div className="settings-search-container">
          <div className="settings-search-box">
            <span className="settings-search-icon">🔍</span>
            <input
              type="text"
              className="settings-search-input"
              placeholder="Search for a setting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="settings-grid">
        {filteredItems.length === 0 ? (
          <div className="settings-empty-state">
            <p>No settings found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="settings-card"
              onClick={() => handleCardClick(item)}
            >
              <div className="settings-card-icon" style={{ color: item.iconColor }}>
                {item.icon}
              </div>
              <div className="settings-card-content">
                <h3 className="settings-card-title">{item.title}</h3>
                <p className="settings-card-description">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

