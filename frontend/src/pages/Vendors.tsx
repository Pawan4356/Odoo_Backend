import { useMemo, useState, type ReactNode } from "react";
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
import { VENDORS } from "../data/mock";
import type { Vendor } from "../types";

const TABS = ["All", "Active", "Pending", "Removed"];

const Vendors = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Vendor | null>(null);

  const role = user!.role;
  const canAdd = role === "admin" || role === "officer";
  const canEdit = role === "admin";

  const filtered = useMemo(() => {
    return VENDORS.filter((v) => (tab === "All" ? true : v.status === tab)).filter(
      (v) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return [v.name, v.category, v.gst, v.contact]
          .join(" ")
          .toLowerCase()
          .includes(s);
      }
    );
  }, [tab, q]);

  // Vendor role only sees their own profile — table & controls hidden
  if (role === "vendor") {
    const self = VENDORS.find((v) => v.id === "v-1")!;
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
                {canEdit && (
                  <>
                    <button className="text-primary cursor-pointer font-body">Edit</button>
                    <button className="text-primary cursor-pointer font-body">Remove</button>
                  </>
                )}
              </div>
            </Td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={6} className="font-body text-[15px] text-ink-soft px-4 py-6 border-t border-hairline-soft text-center">
              No vendors match your filter.
            </td>
          </tr>
        )}
      </Table>

      {adding && <AddVendorModal onClose={() => setAdding(false)} />}
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

const AddVendorModal = ({ onClose }: { onClose: () => void }) => (
  <Modal title="Add Vendor" onClose={onClose}>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
      <Field label="Vendor Name"><TextInput placeholder="Company name" /></Field>
      <Field label="Category">
        <Select>
          <option>Furniture</option>
          <option>IT Hardware</option>
          <option>Office Supplies</option>
          <option>Logistics</option>
          <option>Services</option>
        </Select>
      </Field>
      <Field label="GST Number"><TextInput placeholder="GSTIN" /></Field>
      <Field label="Contact Person"><TextInput /></Field>
      <Field label="Email"><TextInput type="email" /></Field>
      <Field label="Phone Number"><TextInput /></Field>
      <Field label="Country"><TextInput defaultValue="India" /></Field>
      <Field label="Vendor Status">
        <Select>
          <option>Pending</option>
          <option>Active</option>
          <option>Removed</option>
        </Select>
      </Field>
    </div>
    <Field label="Address"><TextInput placeholder="Business address" /></Field>
    <div className="flex justify-end gap-3 mt-3">
      <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
      <ButtonPrimary onClick={onClose}>Save Vendor</ButtonPrimary>
    </div>
  </Modal>
);

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
