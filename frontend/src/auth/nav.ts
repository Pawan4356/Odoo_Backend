import type { Role } from "../types";

export interface NavItem {
  key: string;
  label: string;
  path: string;
  roles: Role[]; // who sees this sidebar entry (structure.md visibility matrix)
}

// Sidebar Navigation — Role Visibility Matrix (structure.md Screen 03)
export const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", roles: ["admin", "manager", "officer", "vendor"] },
  { key: "users", label: "Users", path: "/users", roles: ["admin"] },
  { key: "vendors", label: "Vendors", path: "/vendors", roles: ["admin", "manager", "officer"] },
  { key: "rfqs", label: "RFQs", path: "/rfqs", roles: ["admin", "officer", "vendor"] },
  { key: "quotations", label: "Quotations", path: "/quotations", roles: ["admin", "officer", "vendor"] },
  { key: "approvals", label: "Approvals", path: "/approvals", roles: ["admin", "manager"] },
  { key: "orders", label: "Purchase Orders", path: "/invoices", roles: ["admin", "manager", "officer", "vendor"] },
  { key: "invoices", label: "Invoices", path: "/invoices", roles: ["admin", "officer", "vendor"] },
  { key: "reports", label: "Reports", path: "/reports", roles: ["admin", "manager"] },
  { key: "activity", label: "Activity", path: "/activity", roles: ["admin", "manager", "officer", "vendor"] },
  { key: "vendor-profile", label: "Vendor Profile", path: "/vendor-registration", roles: ["vendor"] },
];

export const navForRole = (role: Role) =>
  // de-dup by path (Purchase Orders + Invoices share /invoices)
  NAV.filter((n) => n.roles.includes(role)).filter(
    (n, i, arr) => arr.findIndex((x) => x.path === n.path) === i
  );

export const canAccessPath = (role: Role, path: string) =>
  NAV.some((n) => n.path === path && n.roles.includes(role));

// Welcome header copy per role (structure.md Screen 03)
export const welcomeFor = (role: Role, name: string) => {
  switch (role) {
    case "admin":
      return "Welcome back, Admin — System Overview";
    case "manager":
      return `Welcome back, ${name} — Approval Overview`;
    case "officer":
      return `Welcome back, ${name} — Today's Overview`;
    case "vendor":
      return `Welcome back, ${name} — RFQ Overview`;
  }
};
