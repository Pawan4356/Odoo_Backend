import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PageHeader,
  ButtonPrimary,
  ButtonSecondary,
  Table,
  Th,
  Td,
  StatusBadge,
  FilterTabs,
  TextInput,
  Field,
  Select,
  SectionEyebrow,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import type { Vendor } from "../types";
import { api } from "../api/client";

const TABS = ["All", "Active", "Pending", "Removed", "Blacklisted"];

const Vendors = () => {
  const { user, token, vendorProfile } = useAuth();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const role = user!.role;
  const canAdd = role === "admin";
  const canEdit = role === "admin";

  const loadVendors = () => {
    if (!token || role === "vendor") return;
    setLoading(true);
    api
      .vendors(token)
      .then((rows) => {
        setVendors(rows);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load vendors."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVendors();
  }, [role, token]);

  const updateStatus = async (vendorId: number | string, newStatus: string) => {
    try {
      await api.updateVendorStatus(token!, vendorId, newStatus);
      setVendors(vendors.map(v => String(v.id) === String(vendorId) ? { ...v, status: newStatus as any } : v));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update vendor status");
    }
  };

  const filtered = useMemo(() => {
    return vendors.filter((v) => (tab === "All" ? true : v.status === tab)).filter(
      (v) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return [v.name, v.category, v.gst, v.contact]
          .join(" ")
          .toLowerCase()
          .includes(s);
      }
    );
  }, [tab, q, vendors]);

  // Vendor role only sees their own profile — table & controls hidden
  if (role === "vendor") {
    const self: Vendor = vendorProfile
      ? {
          id: vendorProfile.id,
          name: vendorProfile.name,
          category: vendorProfile.category || "General",
          gst: vendorProfile.gst,
          contact: vendorProfile.contact,
          email: user?.email ?? "",
          phone: vendorProfile.phone,
          address: "",
          country: "India",
          status: vendorProfile.status,
          rating: 0,
        }
      : {
          id: "",
          name: user?.name ?? "",
          category: "General",
          gst: "",
          contact: "",
          email: user?.email ?? "",
          phone: "",
          address: "",
          country: "India",
          status: "Pending",
          rating: 0,
        };
    return (
      <div>
        <SectionEyebrow>My Vendor Profile</SectionEyebrow>
        <VendorDetail vendor={self} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier profiles and registrations"
        action={canAdd && <ButtonPrimary onClick={() => setAdding(true)}>+ Add Vendor</ButtonPrimary>}
      />

      <div className="mb-4 max-w-[420px]">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendor name, contact, category..."
        />
      </div>

      <FilterTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && (
        <p className="font-body text-[14px] text-ink-faint mb-3">Loading vendors...</p>
      )}
      {loadError && (
        <p className="font-body text-[14px] text-[#c4313b] mb-3">{loadError}</p>
      )}

      <Table
        head={
          <>
            <Th>Vendor Name</Th>
            <Th>Category</Th>
            <Th>GST No.</Th>
            <Th>Contact</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </>
        }
      >
        {filtered.map((v) => (
          <tr key={v.id}>
            <Td>{v.name}</Td>
            <Td>{v.category}</Td>
            <Td>{v.gst}</Td>
            <Td>{v.contact}</Td>
            <Td><StatusBadge status={v.status} /></Td>
            <Td>
              <div className="flex gap-4">
                <button
                  onClick={() => setDetail(v)}
                  className="text-primary cursor-pointer font-body"
                >
                  View
                </button>
                {canEdit && v.status === "Pending" && (
                  <>
                    <button onClick={() => updateStatus(v.id, "Active")} className="text-primary cursor-pointer font-body">Approve</button>
                    <button onClick={() => updateStatus(v.id, "Removed")} className="text-primary cursor-pointer font-body">Reject</button>
                  </>
                )}
                {canEdit && v.status === "Active" && (
                  <button onClick={() => updateStatus(v.id, "Blacklisted")} className="text-primary cursor-pointer font-body text-[#c4313b]">Blacklist</button>
                )}
                {canEdit && (v.status === "Removed" || v.status === "Blacklisted") && (
                  <button onClick={() => updateStatus(v.id, "Active")} className="text-primary cursor-pointer font-body">Restore</button>
                )}
              </div>
            </Td>
          </tr>
        ))}
        {filtered.length === 0 && !loading && (
          <tr>
            <td colSpan={6} className="font-body text-[15px] text-ink-soft px-4 py-6 border-t border-hairline-soft text-center">
              No vendors match your filter.
            </td>
          </tr>
        )}
      </Table>

      {adding && <AddVendorModal onClose={() => setAdding(false)} onSuccess={loadVendors} token={token!} />}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <VendorDetail vendor={detail} />
        </Modal>
      )}
    </div>
  );
};

const DetailCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
    <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
      {title}
    </div>
    <div className="px-5 py-4 font-body text-[15px] text-ink-soft space-y-1 [&_strong]:text-ink [&_strong]:font-medium">
      {children}
    </div>
  </div>
);

const VendorDetail = ({ vendor }: { vendor: Vendor }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <DetailCard title="Company">
      <p><strong>Name:</strong> {vendor.name}</p>
      <p><strong>Category:</strong> {vendor.category}</p>
      <p><strong>GST:</strong> {vendor.gst}</p>
      <p><strong>Status:</strong> {vendor.status}</p>
    </DetailCard>
    <DetailCard title="Contact">
      <p><strong>Person:</strong> {vendor.contact}</p>
      <p><strong>Email:</strong> {vendor.email}</p>
      <p><strong>Phone:</strong> {vendor.phone}</p>
      <p><strong>Address:</strong> {vendor.address}, {vendor.country}</p>
    </DetailCard>
    <div className="sm:col-span-2">
      <DetailCard title="Procurement History">
        <p>Performance rating: <strong>{vendor.rating ? `${vendor.rating} / 5` : "Not yet rated"}</strong></p>
        <p>Assigned RFQs, submitted quotations and purchase orders appear here.</p>
      </DetailCard>
    </div>
  </div>
);

const AddVendorModal = ({ onClose, onSuccess, token }: { onClose: () => void; onSuccess: () => void; token: string }) => {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gstDetails, setGstDetails] = useState("");
  const [category, setCategory] = useState("Office Supplies");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.createVendorByStaff(token, {
        name: contactPerson.trim() || companyName.trim(),
        email: email.trim(),
        password,
        company_name: companyName.trim(),
        contact_person: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        gst_details: gstDetails.trim() || undefined,
        category,
      });
      setMessage("Vendor created successfully with login credentials!");
      onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create vendor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Vendor" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Company Name"><TextInput required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Registered company name" /></Field>
          <Field label="Contact Person"><TextInput value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Primary contact name" /></Field>
          <Field label="Email"><TextInput required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="vendor@company.com" /></Field>
          <Field label="Temporary Password"><TextInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Min 8 characters" /></Field>
          <Field label="Phone"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." /></Field>
          <Field label="GST Details"><TextInput value={gstDetails} onChange={(e) => setGstDetails(e.target.value)} placeholder="GSTIN" /></Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Office Supplies</option>
              <option>Furniture</option>
              <option>IT Hardware</option>
              <option>Logistics</option>
              <option>Services</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Role"><TextInput value="Vendor" disabled /></Field>
        </div>
        {error && <p className="font-body text-[14px] text-[#c4313b] mb-3">{error}</p>}
        {message && <p className="font-body text-[15px] text-[#2d8a4e] mb-3">{message}</p>}
        <div className="flex justify-end gap-3 mt-3">
          <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
          <ButtonPrimary type="submit">{loading ? "Creating..." : "Create Vendor"}</ButtonPrimary>
        </div>
      </form>
    </Modal>
  );
};

/* shared square modal — hard border, flat, no soft shadow */
export const Modal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-auto"
    onClick={onClose}
  >
    <div
      className="bg-canvas rounded-[18px] border border-hairline w-full max-w-[640px] mt-12 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-4 border-b border-hairline-soft flex items-center justify-between">
        <span className="font-display text-[19px] font-semibold tracking-[-0.01em] text-ink">{title}</span>
        <button onClick={onClose} className="text-ink-faint hover:text-ink font-ui text-[18px] cursor-pointer">✕</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default Vendors;
