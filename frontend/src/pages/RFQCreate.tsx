import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  StepIndicator,
  Field,
  TextInput,
  TextArea,
  Select,
  ButtonPrimary,
  ButtonSecondary,
  Table,
  Th,
  Td,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import type { RFQItem, Vendor } from "../types";
import { api } from "../api/client";

const STEPS = ["RFQ Information", "Vendor & Item Details", "Review & Publish"];

const RFQCreate = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const role = user!.role;

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<RFQItem[]>([
    { name: "", quantity: 1, unit: "pcs" },
  ]);
  const [selected, setSelected] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || role !== "officer") return;
    api
      .vendors(token)
      .then((rows) => setVendors(rows))
      .catch(() => setVendors([]));
  }, [role, token]);

  // Only Procurement Officer can create
  if (role !== "officer") {
    return (
      <div>
        <PageHeader title="RFQ Creation" subtitle="Restricted" />
        <div className="rounded-[18px] border border-hairline bg-canvas px-7 py-8 font-body text-[17px] text-ink-soft">
          RFQ creation is available to Procurement Officers only. As{" "}
          <strong className="text-ink font-medium">{role}</strong>, you can view and monitor RFQs from the RFQ list.
          <div className="mt-3">
            <ButtonSecondary onClick={() => navigate("/rfqs")}>Go to RFQ List</ButtonSecondary>
          </div>
        </div>
      </div>
    );
  }

  const addItem = () => setItems((x) => [...x, { name: "", quantity: 1, unit: "pcs" }]);
  const removeItem = (i: number) => setItems((x) => x.filter((_, k) => k !== i));
  const updateItem = (i: number, patch: Partial<RFQItem>) =>
    setItems((x) => x.map((it, k) => (k === i ? { ...it, ...patch } : it)));

  const toggleVendor = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const finish = async (publish: boolean) => {
    setError("");
    setMessage("");
    if (!publish) {
      setMessage("Drafts are not supported by the current backend yet.");
      return;
    }
    if (!token) {
      navigate("/login");
      return;
    }
    const validItems = items.filter((it) => it.name.trim() && it.quantity > 0);
    if (!title.trim() || !deadline || validItems.length === 0) {
      setError("Title, future deadline and at least one item are required.");
      return;
    }
    setSaving(true);
    try {
      await api.createRFQ(token, {
        title: title.trim(),
        description: [category, description].filter(Boolean).join(" — "),
        deadline,
        items: validItems.map((it) => ({
          product_name: it.name.trim(),
          quantity: Number(it.quantity),
          description: it.unit,
        })),
        vendor_ids: selected.map(Number).filter((id) => Number.isInteger(id) && id > 0),
      });
      navigate("/rfqs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to publish RFQ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create RFQ" subtitle="Define requirements, assign vendors, launch the workflow" />
      <StepIndicator steps={STEPS} current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: RFQ information */}
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
            RFQ Information
          </div>
          <div className="p-6">
            <Field label="RFQ Title">
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Office Network Equipment RFQ"
              />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Hardware</option>
                <option>Software</option>
                <option>Office Supplies</option>
                <option>Services</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Deadline" hint="Cannot select a past date.">
              <TextInput
                type="date"
                value={deadline}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
            <Field label="Description">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Requirements, technical specifications, special instructions…"
              />
            </Field>
          </div>
        </div>

        {/* RIGHT: items + vendors */}
        <div className="space-y-6">
          <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
            <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
              Item List
            </div>
            <div className="p-6">
              <Table
                head={
                  <>
                    <Th>Item Name</Th>
                    <Th className="w-[120px]">Qty</Th>
                    <Th className="w-[100px]">Unit</Th>
                    <Th>—</Th>
                  </>
                }
              >
                {items.map((it, i) => (
                  <tr key={i}>
                    <Td>
                      <TextInput
                        value={it.name}
                        onChange={(e) => updateItem(i, { name: e.target.value })}
                        placeholder="Item"
                      />
                    </Td>
                    <Td className="w-[120px]">
                      <TextInput
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                        className="min-w-[80px]"
                      />
                    </Td>
                    <Td className="w-[100px]">
                      <TextInput
                        value={it.unit}
                        onChange={(e) => updateItem(i, { unit: e.target.value })}
                      />
                    </Td>
                    <Td>
                      <button
                        onClick={() => removeItem(i)}
                        className="text-primary cursor-pointer font-body"
                      >
                        Remove
                      </button>
                    </Td>
                  </tr>
                ))}
              </Table>
              <div className="mt-3">
                <ButtonSecondary onClick={addItem}>+ Add Item</ButtonSecondary>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
            <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
              Vendor Selection
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {selected.length === 0 && (
                  <span className="font-body text-[15px] text-ink-faint">No vendors selected.</span>
                )}
                {selected.map((id) => {
                  const v = vendors.find((x) => x.id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-pill bg-primary/10 text-primary font-ui text-[14px] px-3 py-1.5 flex items-center gap-2"
                    >
                      {v?.name ?? `Vendor #${id}`}
                      <button
                        onClick={() => toggleVendor(id)}
                        className="cursor-pointer text-primary/70 hover:text-primary"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
              <ButtonSecondary onClick={() => setPicker(true)}>+ Add Vendor</ButtonSecondary>
            </div>
          </div>
        </div>
      </div>

      {/* action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-8 border-t border-hairline pt-6">
        <div className="flex gap-2">
          <ButtonSecondary onClick={() => setStep((s) => Math.max(1, s - 1))}>
            ‹ Back
          </ButtonSecondary>
          <ButtonSecondary onClick={() => setStep((s) => Math.min(3, s + 1))}>
            Next ›
          </ButtonSecondary>
        </div>
        <div className="flex gap-3">
          <ButtonSecondary onClick={() => finish(false)}>Save as Draft</ButtonSecondary>
          <ButtonPrimary onClick={() => finish(true)}>{saving ? "Publishing..." : "Save & Publish"}</ButtonPrimary>
        </div>
      </div>

      {error && <p className="font-body text-[14px] text-[#c4313b] mt-4">{error}</p>}
      {message && <p className="font-body text-[14px] text-ink-faint mt-4">{message}</p>}

      {picker && (
        <VendorPicker
          vendors={vendors}
          selected={selected}
          onToggle={toggleVendor}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
};

const VendorPicker = ({
  vendors,
  selected,
  onToggle,
  onClose,
}: {
  vendors: Vendor[];
  selected: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) => {
  const [q, setQ] = useState("");
  const rows = vendors.filter((v) => v.status === "Active").filter((v) =>
    (v.name + v.category).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-canvas rounded-[18px] border border-hairline w-full max-w-[520px] mt-12 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-hairline-soft flex items-center justify-between">
          <span className="font-display text-[19px] font-semibold tracking-[-0.01em] text-ink">Select Vendors</span>
          <button onClick={onClose} className="cursor-pointer text-ink-faint hover:text-ink text-[18px]">✕</button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search active vendors..." />
          </div>
          <ul className="rounded-[14px] border border-hairline divide-y divide-hairline-soft overflow-hidden">
            {rows.map((v) => (
              <li key={v.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-body text-[15px] text-ink">
                  {v.name} <span className="text-ink-faint">· {v.category}</span>
                </span>
                <label className="flex items-center gap-2 font-ui text-[14px] text-ink-soft cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(v.id)}
                    onChange={() => onToggle(v.id)}
                  />
                  Assign
                </label>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="px-4 py-6 text-center font-body text-[15px] text-ink-faint">
                No active vendors found.
              </li>
            )}
          </ul>
          <div className="flex justify-end mt-4">
            <ButtonPrimary onClick={onClose}>Done</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQCreate;
