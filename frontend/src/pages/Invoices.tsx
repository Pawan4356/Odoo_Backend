import { useEffect, useState } from "react";
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
import { inr } from "../data/mock";
import type { PaymentStatus } from "../types";
import { api } from "../api/client";
import type { RichPO } from "../api/client";
import { useLocation } from "react-router-dom";
import type { RFQ } from "../types";

const Invoices = () => {
  const { user, token } = useAuth();
  const role = user!.role;
  const location = useLocation();
  const initialRfqId = (location.state as { rfqId?: string } | null)?.rfqId;
  const [orders, setOrders] = useState<RichPO[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      api.purchaseOrders(token),
      api.rfqs(token).catch(() => [] as RFQ[])
    ])
      .then(([poRows, rfqRows]) => {
        setOrders(poRows);
        setRfqs(rfqRows);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load data."))
      .finally(() => setLoading(false));
  }, [token]);

  const [activeRfqId, setActiveRfqId] = useState<string>(String(initialRfqId || ""));
  const [activeId, setActiveId] = useState("");
  const [payment, setPayment] = useState<PaymentStatus>("Pending Payment");

  const rfqList = rfqs.length > 0 ? rfqs : Array.from(new Set(orders.map((po) => po.rfqId))).filter(Boolean).map(id => ({ id, title: `RFQ ${id}` } as RFQ));

  // Update active RFQ when rfqs load
  useEffect(() => {
    if (rfqList.length > 0 && !activeRfqId) {
      setActiveRfqId(String(rfqList[0].id));
    }
  }, [rfqList, activeRfqId]);

  const posForActiveRfq = orders.filter((po) => po.rfqId === activeRfqId);

  // Update active PO when active RFQ changes
  useEffect(() => {
    if (posForActiveRfq.length > 0 && !posForActiveRfq.some((p) => p.id === activeId)) {
      setActiveId(posForActiveRfq[0].id);
      setPayment(posForActiveRfq[0].payment);
    }
  }, [posForActiveRfq, activeId]);

  const po = posForActiveRfq.find((p) => p.id === activeId) ?? posForActiveRfq[0];
  if (loading) return <div className="font-body text-ink-faint">Loading purchase orders...</div>;

  const subtotal = po ? po.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) : 0;
  const taxAmt = po ? (subtotal * po.taxPct) / 100 : 0;
  const grand = po ? subtotal + taxAmt - po.discount : 0;

  const canEmail = role === "admin" || role === "officer";
  const canPay = role === "admin" || role === "officer";
  const canDownload = role !== "manager";

  return (
    <div>
      <PageHeader
        title="Purchase Order & Invoice"
        subtitle={po ? `${po.id} · auto-generated, not editable` : "No purchase orders generated"}
        action={
          <div className="flex flex-wrap gap-2">
            {po && canDownload && <ButtonSecondary onClick={() => window.print()}>Download PDF</ButtonSecondary>}
            {po && canDownload && <ButtonSecondary onClick={() => window.print()}>Print</ButtonSecondary>}
            {po && canEmail && <ButtonPrimary onClick={() => alert("Invoice emailed to vendor. Logged in Activity.")}>Email Invoice</ButtonPrimary>}
          </div>
        }
      />

      {loadError && (
        <p className="font-body text-[14px] text-[#c4313b] mb-3">{loadError}</p>
      )}

      {/* RFQ selector */}
      {rfqList.length > 0 && (
        <div className="mb-4 max-w-sm">
          <label className="block font-ui text-[14px] text-ink-soft mb-2">Select RFQ</label>
          <select
            value={activeRfqId}
            onChange={(e) => setActiveRfqId(e.target.value)}
            className="w-full bg-canvas border border-hairline rounded-lg px-3 py-2 font-body text-[15px] focus:outline-none focus:border-primary appearance-none cursor-pointer"
          >
            {rfqList.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* PO selector when more than one for the active RFQ */}
      {posForActiveRfq.length > 1 && (
        <div className="mb-4 max-w-sm">
          <label className="block font-ui text-[14px] text-ink-soft mb-2">Select Purchase Order</label>
          <select
            value={activeId}
            onChange={(e) => {
              const val = e.target.value;
              setActiveId(val);
              const selectedPO = posForActiveRfq.find(p => p.id === val);
              if (selectedPO) setPayment(selectedPO.payment);
            }}
            className="w-full bg-canvas border border-hairline rounded-lg px-3 py-2 font-body text-[15px] focus:outline-none focus:border-primary appearance-none cursor-pointer"
          >
            {posForActiveRfq.map((p) => (
              <option key={p.id} value={p.id}>
                PO: {p.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {!po ? (
        <div className="font-body text-[15px] text-ink-soft mt-8 text-center border-t border-hairline py-12">
          No purchase orders have been generated for this RFQ yet.
        </div>
      ) : (
        <>
          {/* buyer + vendor cards — DYNAMIC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">Buyer</div>
          <div className="px-5 py-4 font-body text-[15px] text-ink-soft space-y-0.5 [&_strong]:text-ink [&_strong]:font-medium">
            <p><strong>{po.buyerName}</strong></p>
            <p>{po.buyerEmail || "accounts@company.io"}</p>
          </div>
        </div>
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">Vendor</div>
          <div className="px-5 py-4 font-body text-[15px] text-ink-soft space-y-0.5 [&_strong]:text-ink [&_strong]:font-medium">
            <p><strong>{po.vendorName}</strong></p>
            {po.vendorContact && <p>Contact: {po.vendorContact}</p>}
            {po.vendorGst && <p>GSTIN: {po.vendorGst}</p>}
            <p>{po.vendorEmail}</p>
            {po.vendorPhone && <p>{po.vendorPhone}</p>}
          </div>
        </div>
      </div>

      {/* dates */}
      <div className="rounded-[18px] border border-hairline bg-canvas px-6 py-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 font-body text-[15px] text-ink">
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">PO Number</span>{po.id}</div>
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">PO Date</span>{po.poDate}</div>
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">Invoice Date</span>{po.invoiceDate}</div>
        <div><span className="font-ui text-[13px] text-ink-faint block mb-0.5">RFQ</span>{po.rfqTitle || po.rfqId || "—"}</div>
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
        {po.lines.map((l, i) => (
          <tr key={`${l.name}-${i}`}>
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
        </>
      )}
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
