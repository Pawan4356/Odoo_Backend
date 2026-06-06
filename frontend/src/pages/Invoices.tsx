import { useState } from "react";
import {
  PageHeader,
  Table,
  Th,
  Td,
  ButtonPrimary,
  ButtonSecondary,
  StatusBadge,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { PURCHASE_ORDERS, VENDORS, inr } from "../data/mock";
import type { PaymentStatus } from "../types";

const Invoices = () => {
  const { user } = useAuth();
  const role = user!.role;

  // vendor sees only own PO
  const list = role === "vendor"
    ? PURCHASE_ORDERS.filter((p) => p.vendorId === "v-1")
    : PURCHASE_ORDERS;

  const [activeId, setActiveId] = useState(list[0]?.id ?? "");
  const [payment, setPayment] = useState<PaymentStatus>(
    list[0]?.payment ?? "Pending Payment"
  );

  const po = list.find((p) => p.id === activeId) ?? list[0];
  if (!po) return <div className="font-body">No purchase orders.</div>;

  const vendor = VENDORS.find((v) => v.id === po.vendorId)!;
  const subtotal = po.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const taxAmt = (subtotal * po.taxPct) / 100;
  const grand = subtotal + taxAmt - po.discount;

  const canEmail = role === "admin" || role === "officer";
  const canPay = role === "admin" || role === "officer";
  const canDownload = role !== "manager";

  return (
    <div>
      <PageHeader
        title="Purchase Order & Invoice"
        subtitle={`${po.id} · auto-generated, not editable`}
        action={
          <div className="flex flex-wrap gap-2">
            {canDownload && <ButtonSecondary onClick={() => window.print()}>Download PDF</ButtonSecondary>}
            {canDownload && <ButtonSecondary onClick={() => window.print()}>Print</ButtonSecondary>}
            {canEmail && <ButtonPrimary onClick={() => alert("Invoice emailed to vendor. Logged in Activity.")}>Email Invoice</ButtonPrimary>}
          </div>
        }
      />

      {/* PO selector when more than one */}
      {list.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveId(p.id);
                setPayment(p.payment);
              }}
              className={`press active:press-active font-ui text-[14px] px-4 py-1.5 rounded-pill cursor-pointer transition-colors ${
                p.id === activeId ? "bg-primary text-on-primary" : "bg-canvas text-ink-soft border border-hairline"
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>
      )}

      {/* buyer + vendor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">Buyer</div>
          <div className="px-5 py-4 font-body text-[15px] text-ink-soft space-y-0.5 [&_strong]:text-ink [&_strong]:font-medium">
            <p><strong>VendorBridge Pvt. Ltd.</strong></p>
            <p>Plot 22, Tech Park, Pune, India</p>
            <p>GSTIN: 27AAVCV1234B1Z0</p>
            <p>accounts@vendorbridge.io</p>
          </div>
        </div>
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">Vendor</div>
          <div className="px-5 py-4 font-body text-[15px] text-ink-soft space-y-0.5 [&_strong]:text-ink [&_strong]:font-medium">
            <p><strong>{vendor.name}</strong></p>
            <p>{vendor.address}, {vendor.country}</p>
            <p>GSTIN: {vendor.gst}</p>
            <p>{vendor.email}</p>
          </div>
        </div>
      </div>

      {/* dates */}
      <div className="rounded-[18px] border border-hairline bg-canvas px-6 py-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 font-body text-[15px] text-ink">
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">PO Number</span>{po.id}</div>
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">PO Date</span>{po.poDate}</div>
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">Invoice Date</span>{po.invoiceDate}</div>
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">Due Date</span>{po.dueDate}</div>
      </div>

      {/* invoice item table */}
      <Table
        head={
          <>
            <Th>Item</Th>
            <Th>Qty</Th>
            <Th>Unit Price</Th>
            <Th>Total</Th>
          </>
        }
      >
        {po.lines.map((l) => (
          <tr key={l.name}>
            <Td>{l.name}</Td>
            <Td>{l.quantity}</Td>
            <Td>{inr(l.unitPrice)}</Td>
            <Td>{inr(l.quantity * l.unitPrice)}</Td>
          </tr>
        ))}
      </Table>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {/* payment status (bottom-left) */}
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">Payment Status</div>
          <div className="px-5 py-5 font-body text-[15px] text-ink-soft">
            <p className="flex items-center gap-2 mb-4">
              Current: <StatusBadge status={payment} />
            </p>
            {canPay && payment === "Pending Payment" && (
              <ButtonPrimary
                onClick={() => {
                  setPayment("Paid");
                  alert("Invoice marked as Paid. Vendor notified. Logged in Activity.");
                }}
              >
                Mark as Paid
              </ButtonPrimary>
            )}
            {payment === "Paid" && (
              <p className="font-ui text-[14px] font-medium text-[#1d7a3a]">✓ Payment complete</p>
            )}
            {role === "vendor" && payment === "Pending Payment" && (
              <p className="text-ink-faint">Awaiting payment from buyer.</p>
            )}
          </div>
        </div>

        {/* calculation summary (bottom-right) */}
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">Calculation Summary</div>
          <div className="px-5 py-5 font-body text-[15px] text-ink-soft">
            <SumRow label="Subtotal" value={inr(subtotal)} />
            <SumRow label={`GST / Tax (${po.taxPct}%)`} value={inr(taxAmt)} />
            <SumRow label="Discount" value={`− ${inr(po.discount)}`} />
            <div className="border-t border-hairline-soft my-3" />
            <div className="flex items-center justify-between">
              <span className="font-ui text-[15px] font-medium text-ink">Grand Total</span>
              <span className="font-display text-[28px] font-semibold tracking-[-0.02em] leading-none text-ink">{inr(grand)}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="font-body text-[14px] text-ink-faint mt-5">
        Invoice details are never editable post-generation — all data flows from the approved
        quotation. {role === "vendor" && "No financial controls are shown to vendor accounts."}
      </p>
    </div>
  );
};

const SumRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between mb-1.5">
    <span>{label}</span>
    <span className="font-ui font-medium text-ink">{value}</span>
  </div>
);

export default Invoices;
