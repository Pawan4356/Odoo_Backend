import type {
  ApprovalStatus,
  AuthSession,
  PurchaseOrder,
  Quotation,
  RFQ,
  RFQStatus,
  Role,
  User,
  Vendor,
  VendorProfile,
  VendorStatus,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api";

type BackendRole = "Admin" | "Manager" | "Procurement Officer" | "Vendor";

type BackendUser = {
  id: number | string;
  name: string;
  email: string;
  role: BackendRole;
};

type BackendVendor = {
  id: number | string;
  user_id?: number | string;
  company_name: string;
  contact_person?: string | null;
  phone?: string | null;
  gst_details?: string | null;
  category?: string | null;
  status?: string | null;
  email?: string | null;
};

type BackendRFQ = {
  id: number | string;
  title: string;
  description?: string | null;
  deadline: string;
  status?: "Open" | "Closed" | "Completed";
  created_by?: number | string | null;
  items?: BackendRFQItem[];
  vendors?: BackendVendor[];
};

type BackendRFQItem = {
  id: number | string;
  product_name: string;
  quantity: number;
  description?: string | null;
};

type BackendQuotation = {
  id: number | string;
  rfq_id: number | string;
  vendor_id: number | string;
  delivery_timeline?: string | null;
  notes?: string | null;
  status?: "Pending" | "Approved" | "Rejected";
  company_name?: string | null;
  total_amount?: number | string | null;
  items?: {
    rfq_item_id?: number | string;
    product_name?: string;
    quantity?: number;
    unit_price?: number | string;
    calculated_total?: number | string;
  }[];
};

type BackendPO = {
  id: number | string;
  po_number: string;
  quotation_id?: number | string;
  total_amount?: number | string | null;
  status?: "Draft" | "Issued" | "Fulfilled";
  created_at?: string;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const roleFromBackend = (role: string): Role => {
  if (role === "Admin") return "admin";
  if (role === "Manager") return "manager";
  if (role === "Procurement Officer") return "officer";
  return "vendor";
};

export const roleToBackend = (role: Role): BackendRole => {
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  if (role === "officer") return "Procurement Officer";
  return "Vendor";
};

const mapUser = (u: BackendUser): User => ({
  id: String(u.id),
  name: u.name,
  email: u.email,
  role: roleFromBackend(u.role),
  country: "India",
});

const mapStatus = (status?: string | null): VendorStatus => {
  if (status === "Removed") return "Removed";
  if (status === "Pending") return "Pending";
  return "Active";
};

export const mapVendor = (v: BackendVendor): Vendor => ({
  id: String(v.id),
  name: v.company_name,
  category: v.category || "General",
  gst: v.gst_details || "",
  contact: v.contact_person || "",
  email: v.email || "",
  phone: v.phone || "",
  address: "",
  country: "India",
  status: mapStatus(v.status),
  rating: 0,
});

export const mapVendorProfile = (v: BackendVendor): VendorProfile => ({
  id: String(v.id),
  userId: String(v.user_id ?? ""),
  name: v.company_name,
  category: v.category || "",
  gst: v.gst_details || "",
  contact: v.contact_person || "",
  phone: v.phone || "",
  email: v.email || undefined,
  status: mapStatus(v.status),
});

const mapRFQStatus = (status?: BackendRFQ["status"]): RFQStatus => {
  if (status === "Open") return "Active";
  if (status === "Completed") return "Closed";
  return "Closed";
};

export const mapRFQ = (r: BackendRFQ): RFQ => ({
  id: String(r.id),
  title: r.title,
  category: "General",
  deadline: String(r.deadline).slice(0, 10),
  description: r.description || "",
  status: mapRFQStatus(r.status),
  items:
    r.items?.map((item) => ({
      id: String(item.id),
      name: item.product_name,
      quantity: Number(item.quantity),
      unit: item.description || "pcs",
    })) ?? [],
  vendorIds: r.vendors?.map((v) => String(v.id)) ?? [],
  createdBy: String(r.created_by ?? ""),
});

const mapQuotationStatus = (status?: BackendQuotation["status"]): Quotation["status"] => {
  if (status === "Approved") return "Selected";
  if (status === "Rejected") return "Rejected";
  return "Pending Approval";
};

export const mapQuotation = (q: BackendQuotation): Quotation & { vendorName?: string; totalAmount?: number } => ({
  id: String(q.id),
  rfqId: String(q.rfq_id),
  vendorId: String(q.vendor_id),
  status: mapQuotationStatus(q.status),
  lines:
    q.items?.map((item) => ({
      name: item.product_name || `Item ${item.rfq_item_id ?? ""}`.trim(),
      quantity: Number(item.quantity ?? 1),
      unitPrice: Number(item.unit_price ?? item.calculated_total ?? 0),
      deliveryDays: Number.parseInt(q.delivery_timeline || "0", 10) || 0,
    })) ?? [],
  taxPct: 0,
  notes: q.notes || "",
  paymentTermDays: 0,
  vendorName: q.company_name || undefined,
  totalAmount: q.total_amount == null ? undefined : Number(q.total_amount),
});

export const mapPO = (p: BackendPO): PurchaseOrder => ({
  id: p.po_number || String(p.id),
  rfqId: "",
  vendorId: "",
  poDate: String(p.created_at || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
  invoiceDate: String(p.created_at || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
  dueDate: "",
  lines: [
    {
      name: `Approved quotation ${p.quotation_id ?? ""}`.trim(),
      quantity: 1,
      unitPrice: Number(p.total_amount ?? 0),
      deliveryDays: 0,
    },
  ],
  taxPct: 0,
  discount: 0,
  payment: p.status === "Fulfilled" ? "Paid" : "Pending Payment",
  status: p.status === "Fulfilled" ? "Completed" : "Issued",
});

const parseError = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await parseError(res);
    throw new ApiError(res.status, body?.message || "Request failed", body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    const data = await request<{ token: string; user: BackendUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { token: data.token, user: mapUser(data.user) };
  },

  register: (payload: { name: string; email: string; password: string; role: Role }) =>
    request<BackendUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: roleToBackend(payload.role),
      }),
    }),

  registerVendor: async (
    token: string,
    payload: {
      company_name: string;
      contact_person?: string;
      phone?: string;
      gst_details?: string;
      category?: string;
    },
  ) => {
    const vendor = await request<BackendVendor>(
      "/vendors",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    );
    return mapVendorProfile(vendor);
  },

  vendors: async (token: string) => {
    const vendors = await request<BackendVendor[]>("/vendors", {}, token);
    return vendors.map(mapVendor);
  },

  rfqs: async (token: string) => {
    const rfqs = await request<BackendRFQ[]>("/rfqs", {}, token);
    return rfqs.map(mapRFQ);
  },

  rfq: async (token: string, id: string) => {
    const rfq = await request<BackendRFQ>(`/rfqs/${id}`, {}, token);
    return mapRFQ(rfq);
  },

  createRFQ: (token: string, payload: {
    title: string;
    description?: string;
    deadline: string;
    items: { product_name: string; quantity: number; description?: string }[];
    vendor_ids: number[];
  }) =>
    request<BackendRFQ>("/rfqs", { method: "POST", body: JSON.stringify(payload) }, token),

  submitQuotation: (token: string, payload: {
    rfq_id: number;
    vendor_id: number;
    delivery_timeline?: string;
    notes?: string;
    items: { rfq_item_id: number; unit_price: number }[];
  }) =>
    request<BackendQuotation>("/quotations", { method: "POST", body: JSON.stringify(payload) }, token),

  quotationsByRFQ: async (token: string, rfqId: string) => {
    const quotations = await request<BackendQuotation[]>(`/quotations/rfq/${rfqId}`, {}, token);
    return quotations.map(mapQuotation);
  },

  approveQuotation: (
    token: string,
    quotationId: string,
    status: Extract<ApprovalStatus, "Approved" | "Rejected">,
    remarks?: string,
  ) =>
    request<unknown>(
      `/approvals/quotation/${quotationId}`,
      { method: "POST", body: JSON.stringify({ status, remarks }) },
      token,
    ),

  purchaseOrders: async (token: string) => {
    const pos = await request<BackendPO[]>("/pos", {}, token);
    return pos.map(mapPO);
  },
};
