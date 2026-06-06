// Domain types for the VendorBridge procurement UI.
// Front-end only — these mirror the four-role model in structure.md.

export type Role = "admin" | "manager" | "officer" | "vendor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface VendorProfile {
  id: string;
  userId: string;
  name: string;
  category: string;
  gst: string;
  contact: string;
  phone: string;
  email?: string;
  status: VendorStatus;
}

export type VendorStatus = "Active" | "Pending" | "Removed" | "Blacklisted";

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gst: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  status: VendorStatus;
  rating: number; // 0–5 performance score
}

export type RFQStatus = "Draft" | "Active" | "Under Review" | "Closed";

export interface RFQItem {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RFQ {
  id: string;
  title: string;
  category: string;
  deadline: string;
  description: string;
  status: RFQStatus;
  items: RFQItem[];
  vendorIds: string[];
  createdBy: string;
}

export type QuotationStatus =
  | "Draft"
  | "Submitted"
  | "Pending Approval"
  | "Selected"
  | "Rejected";

export interface QuoteLine {
  name: string;
  quantity: number;
  unitPrice: number;
  deliveryDays: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  status: QuotationStatus;
  lines: QuoteLine[];
  taxPct: number;
  notes: string;
  deliveryTimeline?: string;
  paymentTermDays: number;
}

export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected";

export interface Approval {
  id: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  amount: number;
  status: ApprovalStatus;
  remarks: string;
  timeline: { label: string; at: string }[];
}

export type PaymentStatus = "Pending Payment" | "Paid";

export interface PurchaseOrder {
  id: string; // PO number, e.g. PO-2026-006
  rfqId: string;
  vendorId: string;
  poDate: string;
  invoiceDate: string;
  dueDate: string;
  lines: QuoteLine[];
  taxPct: number;
  discount: number;
  payment: PaymentStatus;
  status: "Issued" | "Completed";
}

export type LogCategory = "RFQ" | "Approval" | "Invoice" | "Vendor";

export interface ActivityLog {
  id: string;
  category: LogCategory;
  title: string;
  description: string;
  at: string;
  actorRole: Role;
  vendorId?: string;
}
