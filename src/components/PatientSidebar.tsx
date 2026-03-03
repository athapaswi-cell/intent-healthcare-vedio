import React, { useMemo, useState } from "react";
import { patientMenuSections, NavItem, NavSection } from "../config/patientMenuConfig";
import { getMenuSectionsForRole } from "../config/roleMenuConfig";
import "./PatientSidebar.css";

type BadgeCounts = {
  unreadMessages?: number;
  alerts?: number;
};

type Props = {
  activeRoute?: string;
  onNavigate: (route: string) => void;
  badges?: BadgeCounts;
  user?: {
    name?: string;
    username?: string;
    role?: string;
  };
  onLogout?: () => void;
  menuSections?: NavSection[]; // Allow custom menu sections
};

function Badge({ count }: { count: number }) {
  if (!count || count <= 0) return null;
  const text = count > 99 ? "99+" : String(count);

  return (
    <div className="patient-sidebar-badge">
      <span className="patient-sidebar-badge-text">{text}</span>
    </div>
  );
}

export default function PatientSidebar({ activeRoute, onNavigate, badges, user, onLogout, menuSections }: Props) {
  const [query, setQuery] = useState("");

  // Use provided menuSections or get based on role, or fallback to patient menu
  const sectionsToUse = menuSections || 
    (user?.role ? getMenuSectionsForRole(user.role) : patientMenuSections);

  const filtered: NavSection[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sectionsToUse;

    return sectionsToUse
      .map((s) => ({
        ...s,
        data: s.data.filter((item) => item.title.toLowerCase().includes(q)),
      }))
      .filter((s) => s.data.length > 0);
  }, [query, sectionsToUse]);

  const getBadgeCount = (item: NavItem) => {
    if (!badges) return 0;
    if (item.route === "messages") return badges.unreadMessages || 0;
    if (item.route === "alerts") return badges.alerts || 0;
    return 0;
  };

  const renderItem = (item: NavItem) => {
    const active = activeRoute === item.route;
    const count = getBadgeCount(item);

    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.route)}
        className={`patient-sidebar-item ${active ? "patient-sidebar-item-active" : ""}`}
      >
        {item.icon && <span className="patient-sidebar-item-icon">{item.icon}</span>}
        <span className="patient-sidebar-item-text">{item.title}</span>
        <Badge count={count} />
      </button>
    );
  };

  // Get portal title based on role
  const getPortalTitle = () => {
    switch (user?.role) {
      case 'doctor':
        return '🩺 Doctor Portal';
      case 'admin':
        return '⚙️ Admin Portal';
      case 'hospital':
        return '🏥 Hospital Portal';
      case 'pharmacy':
        return '💊 Pharmacy Portal';
      case 'insurance-agent':
        return '🛡️ Insurance Portal';
      default:
        return '🏥 Patient Portal';
    }
  };

  return (
    <div className="patient-sidebar-container">
      <div className="patient-sidebar-header">
        <h2 className="patient-sidebar-title">{getPortalTitle()}</h2>
        {user && (
          <div className="patient-sidebar-user-info">
            <p className="patient-sidebar-user-name">{user.name || user.username}</p>
            <p className="patient-sidebar-user-role">{user.role || "User"}</p>
            {onLogout && (
              <button onClick={onLogout} className="patient-sidebar-logout-btn">
                Logout
              </button>
            )}
          </div>
        )}
      </div>

      <div className="patient-sidebar-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the menu"
          className="patient-sidebar-search-input"
        />
      </div>

      <div className="patient-sidebar-content">
        {filtered.map((section) => (
          <div key={section.title} className="patient-sidebar-section">
            <div className="patient-sidebar-section-header">
              <h3 className="patient-sidebar-section-title">{section.title}</h3>
            </div>
            <div className="patient-sidebar-section-items">
              {section.data.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

