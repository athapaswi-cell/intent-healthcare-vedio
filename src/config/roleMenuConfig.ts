import { NavSection } from './patientMenuConfig';

// Generate menu sections based on user role
export function getMenuSectionsForRole(role: string | undefined): NavSection[] {
  switch (role) {
    case 'patient':
      return [
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
          title: "Unity Care",
          data: [
            { id: "unity-care", title: "Unity Care", route: "unity-care", icon: "🤝" }
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

    case 'doctor':
      return [
        {
          title: "Dashboard & Overview",
          data: [
            { id: "dashboard", title: "Dashboard", route: "dashboard", icon: "🏠" },
            { id: "appointments", title: "Appointments", route: "appointments", icon: "📅" }
          ]
        },
        {
          title: "Patients",
          data: [
            { id: "patients-list", title: "Patient List", route: "patients-list", icon: "👤" },
            { id: "patients-history", title: "Medical History", route: "patients-history", icon: "📋" },
            { id: "patients-visits", title: "Visits", route: "patients-visits", icon: "🏥" }
          ]
        },
        {
          title: "Communication",
          data: [
            { id: "messages", title: "Messages", route: "messages", icon: "💬" }
          ]
        },
        {
          title: "Medical Records",
          data: [
            { id: "medical-records", title: "Medical Records", route: "medical-records", icon: "📋" },
            { id: "test-results", title: "Test Results", route: "test-results", icon: "🔬" }
          ]
        },
        {
          title: "Unity Care",
          data: [
            { id: "unity-care", title: "Unity Care", route: "unity-care", icon: "🤝" }
          ]
        },
        {
          title: "Settings",
          data: [
            { id: "settings", title: "Settings", route: "settings", icon: "⚙️" },
            { id: "security", title: "Security Settings", route: "security", icon: "🔒" },
            { id: "admin", title: "Admin / Configuration", route: "admin", icon: "⚙️" }
          ]
        }
      ];

    case 'admin':
      return [
        {
          title: "Dashboard & Overview",
          data: [
            { id: "dashboard", title: "Dashboard", route: "dashboard", icon: "🏠" }
          ]
        },
        {
          title: "Management",
          data: [
            { id: "patients-list", title: "Patients", route: "patients-list", icon: "👤" },
            { id: "doctors-directory", title: "Doctors", route: "doctors-directory", icon: "🩺" },
            { id: "hospitals-facilities", title: "Hospitals", route: "hospitals-facilities", icon: "🏥" }
          ]
        },
        {
          title: "Insurance",
          data: [
            { id: "insurance-policies", title: "Policies", route: "insurance-policies", icon: "🛡️" },
            { id: "insurance-claims", title: "Claims", route: "insurance-claims", icon: "📄" }
          ]
        },
        {
          title: "Communication",
          data: [
            { id: "messages", title: "Messages", route: "messages", icon: "💬" }
          ]
        },
        {
          title: "Unity Care",
          data: [
            { id: "unity-care", title: "Unity Care", route: "unity-care", icon: "🤝" }
          ]
        },
        {
          title: "Settings",
          data: [
            { id: "settings", title: "Settings", route: "settings", icon: "⚙️" },
            { id: "security", title: "Security Settings", route: "security", icon: "🔒" },
            { id: "admin", title: "Admin / Configuration", route: "admin", icon: "⚙️" }
          ]
        }
      ];

    case 'hospital':
      return [
        {
          title: "Dashboard & Overview",
          data: [
            { id: "dashboard", title: "Dashboard", route: "dashboard", icon: "🏠" },
            { id: "admissions", title: "Admissions", route: "admissions", icon: "🏥" }
          ]
        },
        {
          title: "Patients",
          data: [
            { id: "patients-list", title: "Patient List", route: "patients-list", icon: "👤" },
            { id: "appointments", title: "Appointments", route: "appointments", icon: "📅" }
          ]
        },
        {
          title: "Doctors",
          data: [
            { id: "doctors-directory", title: "Doctor Directory", route: "doctors-directory", icon: "🩺" }
          ]
        },
        {
          title: "Unity Care",
          data: [
            { id: "unity-care", title: "Unity Care", route: "unity-care", icon: "🤝" }
          ]
        },
        {
          title: "Settings",
          data: [
            { id: "settings", title: "Settings", route: "settings", icon: "⚙️" },
            { id: "security", title: "Security Settings", route: "security", icon: "🔒" },
            { id: "admin", title: "Admin / Configuration", route: "admin", icon: "⚙️" }
          ]
        }
      ];

    case 'pharmacy':
      return [
        {
          title: "Dashboard & Overview",
          data: [
            { id: "dashboard", title: "Dashboard", route: "dashboard", icon: "🏠" }
          ]
        },
        {
          title: "Prescriptions",
          data: [
            { id: "pharmacy-prescriptions", title: "Prescriptions", route: "pharmacy-prescriptions", icon: "💊" },
            { id: "orders", title: "Orders", route: "orders", icon: "📦" }
          ]
        },
        {
          title: "Inventory",
          data: [
            { id: "pharmacy-inventory", title: "Inventory", route: "pharmacy-inventory", icon: "📋" }
          ]
        },
        {
          title: "Customers",
          data: [
            { id: "customers", title: "Customers", route: "customers", icon: "👥" }
          ]
        },
        {
          title: "Unity Care",
          data: [
            { id: "unity-care", title: "Unity Care", route: "unity-care", icon: "🤝" }
          ]
        },
        {
          title: "Settings",
          data: [
            { id: "settings", title: "Settings", route: "settings", icon: "⚙️" },
            { id: "security", title: "Security Settings", route: "security", icon: "🔒" },
            { id: "admin", title: "Admin / Configuration", route: "admin", icon: "⚙️" }
          ]
        }
      ];

    case 'insurance-agent':
      return [
        {
          title: "Dashboard & Overview",
          data: [
            { id: "dashboard", title: "Dashboard", route: "dashboard", icon: "🏠" }
          ]
        },
        {
          title: "Insurance",
          data: [
            { id: "policyholders", title: "Policyholders", route: "policyholders", icon: "👥" },
            { id: "insurance-policies", title: "Policies", route: "insurance-policies", icon: "🛡️" },
            { id: "insurance-claims", title: "Claims", route: "insurance-claims", icon: "📄" }
          ]
        },
        {
          title: "Providers",
          data: [
            { id: "providers", title: "Providers", route: "providers", icon: "🏥" }
          ]
        },
        {
          title: "Unity Care",
          data: [
            { id: "unity-care", title: "Unity Care", route: "unity-care", icon: "🤝" }
          ]
        },
        {
          title: "Settings",
          data: [
            { id: "settings", title: "Settings", route: "settings", icon: "⚙️" },
            { id: "security", title: "Security Settings", route: "security", icon: "🔒" },
            { id: "admin", title: "Admin / Configuration", route: "admin", icon: "⚙️" }
          ]
        }
      ];

    default:
      return [
        {
          title: "Dashboard",
          data: [
            { id: "dashboard", title: "Dashboard", route: "dashboard", icon: "🏠" }
          ]
        },
        {
          title: "Unity Care",
          data: [
            { id: "unity-care", title: "Unity Care", route: "unity-care", icon: "🤝" }
          ]
        }
      ];
  }
}

