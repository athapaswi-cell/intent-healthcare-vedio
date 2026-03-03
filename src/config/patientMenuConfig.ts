export type NavItem = {
  id: string;
  title: string;
  route: string;
  icon?: string;
};

export type NavSection = {
  title: string;
  data: NavItem[];
};

export const patientMenuSections: NavSection[] = [
  {
    title: "Appointments & Care",
    data: [
      { id: "schedule", title: "Schedule an Appointment", route: "appointments", icon: "📅" },
      { id: "visits", title: "Visits", route: "patients-visits", icon: "🏥" }
    ]
  },
  {
    title: "Messages & Support",
    data: [
      { id: "messages", title: "Messages", route: "messages", icon: "💬" },
      { id: "ask", title: "Ask a Question", route: "health-query", icon: "❓" }
    ]
  },
  {
    title: "My Health Record",
    data: [
      { id: "alerts", title: "Alerts", route: "alerts", icon: "🚨" },
      { id: "testResults", title: "Test Results", route: "test-results", icon: "🔬" },
      { id: "medications", title: "Medications", route: "medications", icon: "💊" },
      { id: "medicalHistory", title: "Medical History", route: "patients-history", icon: "📋" }
    ]
  },
  {
    title: "Settings",
    data: [
      { id: "personal", title: "Personal Information", route: "personal-info", icon: "👤" },
      { id: "security", title: "Security Settings", route: "security", icon: "🔒" },
      { id: "home", title: "Back to Home Page", route: "dashboard", icon: "🏠" }
    ]
  }
];

