import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { RFQS, inr } from "../data/mock";

const RFQ = RFQS.find((r) => r.id === "RFQ-2026-014")!;

const QuotationSubmit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user!.role;

  // pricing state, one entry per RFQ item
  const [prices, setPrices] = useState<number[]>(RFQ.items.map(() => 0));
  const [delivery, setDelivery] = useState<number[]>(RFQ.items.map(() => 7));
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const readOnly = role !== "vendor" || submitted;

  const subtotal = RFQ.items.reduce(
    (s, it, i) => s + it.quantity * (prices[i] || 0),
    0
  );
  const taxAmt = (subtotal * tax) / 100;
  const grand = subtotal + taxAmt;

  return (
    <div>
      <PageHeader
        title="Submit Quotation"
        subtitle={`RFQ: ${RFQ.title} · Deadline: ${RFQ.deadline}`}
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
              <p className="mb-1 text-ink font-medium">{RFQ.title}</p>
              <p className="mb-1">
                Requirement:{" "}
                {RFQ.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
              <p>{RFQ.description}</p>
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
                {RFQ.items.map((it, i) => (
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
                  <ButtonPrimary onClick={() => setSubmitted(true)}>Submit Quotation</ButtonPrimary>
                </>
              )}
            </div>
          )}
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
