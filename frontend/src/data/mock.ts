import type {
  Vendor,
  RFQ,
  Quotation,
  Approval,
  PurchaseOrder,
  ActivityLog,
  User,
  Role,
} from "../types";

// Demo accounts keyed by role slug AND by email for sign-in lookup.
export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: "u-admin",
    name: "Admin",
    email: "admin@vendorbridge.io",
    role: "admin",
    country: "India",
  },
  manager: {
    id: "u-mgr",
    name: "Priya Menon",
    email: "priya@vendorbridge.io",
    role: "manager",
    country: "India",
  },
  officer: {
    id: "u-po",
    name: "Rohan Shah",
    email: "rohan@vendorbridge.io",
    role: "officer",
    country: "India",
  },
  vendor: {
    id: "u-vendor",
    name: "Infra Supplies",
    email: "sales@infrasupplies.com",
    role: "vendor",
    country: "India",
  },
};

// Lookup by email for the sign-in form.
export const DEMO_USERS_BY_EMAIL: Record<string, User> = Object.fromEntries(
  Object.values(DEMO_USERS).map((u) => [u.email, u])
);

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  officer: "Procurement Officer",
  vendor: "Vendor",
};

export const VENDORS: Vendor[] = [
  {
    id: "v-1",
    name: "Infra Supplies",
    category: "Furniture",
    gst: "27AABCI1234F1Z5",
    contact: "Anil Kumar",
    email: "sales@infrasupplies.com",
    phone: "+91 98200 11223",
    address: "14 MIDC, Andheri East, Mumbai",
    country: "India",
    status: "Active",
    rating: 4.6,
  },
  {
    id: "v-2",
    name: "TechStore LTD",
    category: "IT Hardware",
    gst: "29AAGCT9876H1Z2",
    contact: "Meera Iyer",
    email: "orders@techstore.com",
    phone: "+91 99000 44556",
    address: "Whitefield, Bengaluru",
    country: "India",
    status: "Active",
    rating: 4.2,
  },
  {
    id: "v-3",
    name: "Office Mart Corp",
    category: "Office Supplies",
    gst: "07AADCO5566K1Z9",
    contact: "Sandeep Rao",
    email: "hello@officemart.com",
    phone: "+91 98111 77889",
    address: "Connaught Place, New Delhi",
    country: "India",
    status: "Active",
    rating: 3.9,
  },
  {
    id: "v-4",
    name: "ABC Supplier",
    category: "Furniture",
    gst: "24AABCA3344P1Z1",
    contact: "Farah Sheikh",
    email: "abc@abcsupplier.com",
    phone: "+91 90011 22334",
    address: "Navrangpura, Ahmedabad",
    country: "India",
    status: "Pending",
    rating: 0,
  },
  {
    id: "v-5",
    name: "LogiMove Logistics",
    category: "Logistics",
    gst: "33AAFCL2211M1Z7",
    contact: "Vikram Nair",
    email: "ops@logimove.com",
    phone: "+91 95000 33445",
    address: "Guindy, Chennai",
    country: "India",
    status: "Removed",
    rating: 3.1,
  },
];

export const RFQS: RFQ[] = [
  {
    id: "RFQ-2026-014",
    title: "Office Furniture Procurement",
    category: "Furniture",
    deadline: "2026-06-15",
    description:
      "Ergonomic seating and height-adjustable desks for the new floor. Chairs ×20, Standing Desk ×10. BIFMA-rated, 3-year warranty preferred.",
    status: "Under Review",
    items: [
      { name: "Ergonomic Chair", quantity: 20, unit: "pcs" },
      { name: "Standing Desk", quantity: 10, unit: "pcs" },
    ],
    vendorIds: ["v-1", "v-2", "v-3"],
    createdBy: "u-po",
  },
  {
    id: "RFQ-2026-015",
    title: "Office Network Equipment",
    category: "IT Hardware",
    deadline: "2026-06-22",
    description:
      "Managed switches, access points and structured cabling for HQ expansion. Gigabit minimum, vendor-installed.",
    status: "Active",
    items: [
      { name: "48-Port Managed Switch", quantity: 4, unit: "pcs" },
      { name: "Wi-Fi 6 Access Point", quantity: 24, unit: "pcs" },
    ],
    vendorIds: ["v-2"],
    createdBy: "u-po",
  },
  {
    id: "RFQ-2026-016",
    title: "Quarterly Stationery Supply",
    category: "Office Supplies",
    deadline: "2026-06-30",
    description: "Recurring stationery and printer consumables for all departments.",
    status: "Draft",
    items: [{ name: "A4 Paper (ream)", quantity: 200, unit: "reams" }],
    vendorIds: [],
    createdBy: "u-po",
  },
];

export const QUOTATIONS: Quotation[] = [
  {
    id: "Q-1",
    rfqId: "RFQ-2026-014",
    vendorId: "v-4",
    status: "Submitted",
    lines: [
      { name: "Ergonomic Chair", quantity: 20, unitPrice: 6200, deliveryDays: 12 },
      { name: "Standing Desk", quantity: 10, unitPrice: 14500, deliveryDays: 12 },
    ],
    taxPct: 18,
    notes: "Net-30 payment. 3-year warranty on frames.",
    paymentTermDays: 30,
  },
  {
    id: "Q-2",
    rfqId: "RFQ-2026-014",
    vendorId: "v-2",
    status: "Submitted",
    lines: [
      { name: "Ergonomic Chair", quantity: 20, unitPrice: 5900, deliveryDays: 18 },
      { name: "Standing Desk", quantity: 10, unitPrice: 15200, deliveryDays: 18 },
    ],
    taxPct: 18,
    notes: "Net-45 payment. Installation included.",
    paymentTermDays: 45,
  },
  {
    id: "Q-3",
    rfqId: "RFQ-2026-014",
    vendorId: "v-3",
    status: "Submitted",
    lines: [
      { name: "Ergonomic Chair", quantity: 20, unitPrice: 6450, deliveryDays: 9 },
      { name: "Standing Desk", quantity: 10, unitPrice: 13900, deliveryDays: 9 },
    ],
    taxPct: 18,
    notes: "Net-30 payment. Fastest dispatch, ex-stock.",
    paymentTermDays: 30,
  },
];

export const APPROVALS: Approval[] = [
  {
    id: "AP-1",
    rfqId: "RFQ-2026-014",
    quotationId: "Q-1",
    vendorId: "v-1",
    amount: 264500,
    status: "Pending Approval",
    remarks: "",
    timeline: [
      { label: "Quotation submitted by Procurement Officer", at: "2026-06-02 10:30 AM" },
      { label: "Comparison completed — Infra Supplies selected", at: "2026-06-03 02:15 PM" },
      { label: "Forwarded for managerial approval", at: "2026-06-03 02:16 PM" },
    ],
  },
  {
    id: "AP-2",
    rfqId: "RFQ-2026-015",
    quotationId: "Q-2",
    vendorId: "v-2",
    amount: 418000,
    status: "Approved",
    remarks: "Within budget. Proceed with PO generation.",
    timeline: [
      { label: "Quotation submitted by Procurement Officer", at: "2026-05-28 09:00 AM" },
      { label: "Approved by Priya Menon", at: "2026-05-29 11:20 AM" },
    ],
  },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-2026-006",
    rfqId: "RFQ-2026-015",
    vendorId: "v-2",
    poDate: "2026-05-29",
    invoiceDate: "2026-05-29",
    dueDate: "2026-06-28",
    lines: [
      { name: "48-Port Managed Switch", quantity: 4, unitPrice: 62000, deliveryDays: 14 },
      { name: "Wi-Fi 6 Access Point", quantity: 24, unitPrice: 7000, deliveryDays: 14 },
    ],
    taxPct: 18,
    discount: 5000,
    payment: "Pending Payment",
    status: "Issued",
  },
  {
    id: "PO-2026-005",
    rfqId: "RFQ-2026-014",
    vendorId: "v-1",
    poDate: "2026-05-12",
    invoiceDate: "2026-05-12",
    dueDate: "2026-06-11",
    lines: [
      { name: "Ergonomic Chair", quantity: 20, unitPrice: 6200, deliveryDays: 12 },
      { name: "Standing Desk", quantity: 10, unitPrice: 14500, deliveryDays: 12 },
    ],
    taxPct: 18,
    discount: 0,
    payment: "Paid",
    status: "Completed",
  },
];

export const ACTIVITY: ActivityLog[] = [
  {
    id: "L-1",
    category: "Invoice",
    title: "Invoice generated",
    description: "PO-2026-006 created and emailed to TechStore LTD",
    at: "2026-06-03, 11:00 AM",
    actorRole: "officer",
    vendorId: "v-2",
  },
  {
    id: "L-2",
    category: "Approval",
    title: "Approval granted",
    description: "₹4,18,000 approved by Priya Menon for RFQ-2026-015",
    at: "2026-05-29, 09:15 AM",
    actorRole: "manager",
  },
  {
    id: "L-3",
    category: "Vendor",
    title: "Quotation submitted",
    description: "Infra Supplies submitted quotation for Office Furniture Procurement",
    at: "2026-06-02, 10:30 AM",
    actorRole: "vendor",
    vendorId: "v-1",
  },
  {
    id: "L-4",
    category: "RFQ",
    title: "RFQ published",
    description: "Office Network Equipment RFQ published to 1 vendor",
    at: "2026-05-20, 04:45 PM",
    actorRole: "officer",
  },
  {
    id: "L-5",
    category: "Vendor",
    title: "Vendor registered",
    description: "ABC Supplier submitted registration — awaiting approval",
    at: "2026-05-18, 01:10 PM",
    actorRole: "vendor",
    vendorId: "v-4",
  },
  {
    id: "L-6",
    category: "Invoice",
    title: "Payment received",
    description: "PO-2026-005 marked as Paid",
    at: "2026-05-30, 03:30 PM",
    actorRole: "officer",
    vendorId: "v-1",
  },
];

// ---- small helpers used across screens ----
export const vendorName = (id: string) =>
  VENDORS.find((v) => v.id === id)?.name ?? "Unknown Vendor";

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const quoteSubtotal = (q: { lines: { quantity: number; unitPrice: number }[] }) =>
  q.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

export const quoteGrand = (q: {
  lines: { quantity: number; unitPrice: number }[];
  taxPct: number;
}) => {
  const sub = quoteSubtotal(q);
  return sub + (sub * q.taxPct) / 100;
};
