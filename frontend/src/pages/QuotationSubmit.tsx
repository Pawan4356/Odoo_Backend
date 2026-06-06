import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PageHeader,
  Table,
  Th,
  Td,
  TextInput,
  TextArea,
  Field,
  ButtonPrimary,
  ButtonSecondary,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { inr } from "../data/mock";
import { api } from "../api/client";
import type { RFQ } from "../types";

const EMPTY_RFQ: RFQ = { id: "", title: "Loading...", category: "", deadline: "", description: "", status: "Active", items: [], vendorIds: [], createdBy: "" };

const QuotationSubmit = () => {
  const { user, token, vendorProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user!.role;
  const rfqId = (location.state as { rfqId?: string } | null)?.rfqId ?? "";
  const [rfq, setRfq] = useState<RFQ>(EMPTY_RFQ);

  // pricing state, one entry per RFQ item
  const [prices, setPrices] = useState<number[]>([]);
  const [delivery, setDelivery] = useState<number[]>([]);
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !/^\d+$/.test(rfqId)) return;
    Promise.all([
      api.rfq(token, rfqId),
      api.quotationsByRFQ(token, rfqId).catch(() => [])
    ])
      .then(([row, quotes]) => {
        setRfq(row);
        const existing = quotes.find((q) => q.vendorId === String(vendorProfile?.id));
        if (existing) {
          setSubmitted(true);
          setNotes(existing.notes || "");
          setPrices(row.items.map((it) => {
            // Map back by order or name
            const match = existing.lines.find((l) => l.name.includes(it.name) || it.name.includes(l.name));
            return match ? match.unitPrice : 0;
          }));
          setDelivery(row.items.map((it) => {
            const match = existing.lines.find((l) => l.name.includes(it.name) || it.name.includes(l.name));
            return match ? match.deliveryDays : 7;
          }));
        } else {
          setPrices(row.items.map(() => 0));
          setDelivery(row.items.map(() => 7));
        }
      })
      .catch(() => undefined);
  }, [rfqId, token, vendorProfile?.id]);

  const readOnly = role !== "vendor" || submitted;

  const subtotal = rfq.items.reduce(
    (s, it, i) => s + it.quantity * (prices[i] || 0),
    0
  );
  const taxAmt = (subtotal * tax) / 100;
  const grand = subtotal + taxAmt;

  const submitQuotation = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!vendorProfile?.id) {
      setError("Complete your vendor profile before submitting a quotation.");
      return;
    }
    const backendItems = rfq.items
      .map((it, i) => ({
        rfq_item_id: Number(it.id),
        unit_price: Number(prices[i] || 0),
      }))
      .filter((it) => Number.isInteger(it.rfq_item_id) && it.rfq_item_id > 0);

    if (!/^\d+$/.test(rfq.id) || backendItems.length !== rfq.items.length) {
      setError("This RFQ was not loaded from the backend. Open a live RFQ before submitting.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.submitQuotation(token, {
        rfq_id: Number(rfq.id),
        vendor_id: Number(vendorProfile.id),
        delivery_timeline: `${Math.max(...delivery)} days`,
        notes,
        items: backendItems,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit quotation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Submit Quotation"
        subtitle={`RFQ: ${rfq.title} · Deadline: ${rfq.deadline}`}
      />

      {role !== "vendor" && (
        <div className="rounded-[14px] border border-hairline bg-parchment px-5 py-3 mb-6 font-body text-[15px] text-ink-soft">
          Read-only view — as <strong className="text-ink font-medium">{role}</strong> you are monitoring this quotation.
          {role === "officer" && (
            <button
              onClick={() => navigate("/quotations")}
              className="text-primary ml-2 cursor-pointer"
            >
              Open comparison ›
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ summary (read-only) */}
          <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
            <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
              RFQ Summary
            </div>
            <div className="px-5 py-4 font-body text-[15px] text-ink-soft">
              <p className="mb-1 text-ink font-medium">{rfq.title}</p>
              <p className="mb-1">
                Requirement:{" "}
                {rfq.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
              <p>{rfq.description}</p>
            </div>
          </div>

          {/* quotation items */}
          <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
            <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
              Quotation Items
            </div>
            <div className="p-6">
              <Table
                head={
                  <>
                    <Th>Item</Th>
                    <Th>Qty</Th>
                    <Th>Unit Price</Th>
                    <Th>Total</Th>
                    <Th>Delivery (days)</Th>
                  </>
                }
              >
                {rfq.items.map((it, i) => (
                  <tr key={it.name}>
                    <Td>{it.name}</Td>
                    <Td>{it.quantity}</Td>
                    <Td className="w-[130px]">
                      <TextInput
                        type="number"
                        min={0}
                        disabled={readOnly}
                        value={prices[i] || ""}
                        placeholder="0"
                        onChange={(e) =>
                          setPrices((p) => p.map((v, k) => (k === i ? Number(e.target.value) : v)))
                        }
                      />
                    </Td>
                    <Td>{inr(it.quantity * (prices[i] || 0))}</Td>
                    <Td className="w-[120px]">
                      <TextInput
                        type="number"
                        min={1}
                        disabled={readOnly}
                        value={delivery[i]}
                        onChange={(e) =>
                          setDelivery((d) => d.map((v, k) => (k === i ? Number(e.target.value) : v)))
                        }
                      />
                    </Td>
                  </tr>
                ))}
              </Table>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mt-4">
                <Field label="Tax / GST %">
                  <TextInput
                    type="number"
                    min={0}
                    disabled={readOnly}
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                  />
                </Field>
              </div>

              <Field label="Vendor Notes">
                <TextArea
                  disabled={readOnly}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, delivery notes, warranty…"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* summary card (right) */}
        <div>
          <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden sticky top-[120px]">
            <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
              Quotation Summary
            </div>
            <div className="px-5 py-5 font-body text-[15px] text-ink-soft">
              <Row label="Subtotal" value={inr(subtotal)} />
              <Row label={`GST / Tax (${tax}%)`} value={inr(taxAmt)} />
              <div className="border-t border-hairline-soft my-3" />
              <div className="flex items-center justify-between">
                <span className="font-ui text-[15px] font-medium text-ink">Grand Total</span>
                <span className="font-display text-[28px] font-semibold tracking-[-0.02em] leading-none text-ink">{inr(grand)}</span>
              </div>
            </div>
          </div>

          {role === "vendor" && (
            <div className="flex flex-col gap-3 mt-5">
              {submitted ? (
                <div className="rounded-[14px] border border-hairline bg-parchment px-5 py-4 font-body text-[15px] text-ink-soft">
                  Quotation submitted &amp; locked. Editing is disabled.
                </div>
              ) : (
                <>
                  <ButtonSecondary onClick={() => alert("Draft saved.")}>Save Draft</ButtonSecondary>
                  <ButtonPrimary onClick={submitQuotation}>{loading ? "Submitting..." : "Submit Quotation"}</ButtonPrimary>
                </>
              )}
            </div>
          )}
          {error && <p className="font-body text-[14px] text-[#c4313b] mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between mb-1.5">
    <span>{label}</span>
    <span className="font-ui font-medium text-ink">{value}</span>
  </div>
);

export default QuotationSubmit;
