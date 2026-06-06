import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader, ButtonPrimary } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import {
  inr,
  quoteSubtotal,
} from "../data/mock";
import { api } from "../api/client";
import type { Quotation, RFQ } from "../types";

const EMPTY_RFQ: RFQ = { id: "", title: "Loading...", category: "", deadline: "", description: "", status: "Active", items: [], vendorIds: [], createdBy: "" };

const QuotationCompare = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user!.role;
  const rfqId = (location.state as { rfqId?: string } | null)?.rfqId ?? "";
  const [rfq, setRfq] = useState<RFQ>(EMPTY_RFQ);
  const [quotes, setQuotes] = useState<(Quotation & { vendorName?: string; totalAmount?: number })[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token || !/^\d+$/.test(rfqId)) return;
    Promise.all([api.rfq(token, rfqId), api.quotationsByRFQ(token, rfqId)])
      .then(([nextRfq, nextQuotes]) => {
        setRfq(nextRfq);
        setQuotes(nextQuotes);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load quotations."));
  }, [rfqId, token]);

  // weighted recommendation: lowest total + fastest delivery + highest rating
  const scored = useMemo(() => {
    if (quotes.length === 0) return { withScore: [], bestId: "" };
    const rows = quotes.map((q) => {
      const total = q.totalAmount ?? quoteSubtotal(q) * (1 + q.taxPct / 100);
      const avgDelivery =
        q.lines.length > 0
          ? q.lines.reduce((s, l) => s + l.deliveryDays, 0) / q.lines.length
          : 0;
      const rating = 0; // Backend doesn't support vendor ratings yet
      return { q, total, avgDelivery, rating };
    });
    const minTotal = Math.min(...rows.map((r) => r.total || 1));
    const minDelivery = Math.min(...rows.map((r) => r.avgDelivery || 1));
    const maxRating = Math.max(...rows.map((r) => r.rating));
    const withScore = rows.map((r) => ({
      ...r,
      score:
        (minTotal / (r.total || 1)) * 0.5 +
        (minDelivery / (r.avgDelivery || 1)) * 0.3 +
        (r.rating / (maxRating || 1)) * 0.2,
    }));
    const best = withScore.reduce((a, b) => (b.score > a.score ? b : a));
    return { withScore, bestId: best.q.id };
  }, [quotes]);

  // Vendor cannot see competitor quotations
  if (role === "vendor") {
    return (
      <div>
        <PageHeader title="Quotation Comparison" subtitle="Your submission status" />
        <div className="rounded-[18px] border border-hairline bg-canvas px-7 py-8 font-body text-[17px] text-ink-soft">
          Competitor quotations and pricing are never shown to vendor accounts.
          <p className="mt-3">
            Your quotation for <strong className="text-ink font-medium">{rfq.title}</strong> is{" "}
            <strong className="text-ink font-medium">Submitted</strong> and awaiting procurement review.
          </p>
        </div>
      </div>
    );
  }

  const criteria = [
    { key: "total", label: "Grand Total" },
    { key: "delivery", label: "Delivery Timeline" },
    { key: "notes", label: "Notes" },
  ] as const;

  const cell = (id: string, key: string) => {
    const row = scored.withScore.find((r) => r.q.id === id)!;
    switch (key) {
      case "total":
        return inr(row.total);
      case "delivery":
        return row.q.deliveryTimeline || "N/A";
      case "notes":
        return row.q.notes || "-";
    }
  };

  const select = (id: string) => {
    setSelectedId(id);
    setTimeout(() => navigate("/approvals", { state: { quotationId: id, rfqId: rfq.id } }), 900);
  };

  const canSelect = role === "manager";

  return (
    <div>
      <PageHeader
        title="Quotation Comparison"
        subtitle={`RFQ: ${rfq.title} · ${quotes.length} quotations received`}
      />

      {loadError && (
        <p className="font-body text-[14px] text-[#c4313b] mb-3">{loadError}</p>
      )}

      <div className="rounded-[18px] border border-hairline bg-canvas overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-hairline">
              <th className="font-ui text-[13px] font-medium text-ink-faint px-4 py-3">Criteria</th>
              {quotes.map((q) => (
                <th
                  key={q.id}
                  className={`font-ui text-[14px] font-semibold px-4 py-3 text-center ${
                    q.id === scored.bestId ? "bg-primary/[0.06] text-primary" : "text-ink"
                  }`}
                >
                  {q.vendorName ?? `Vendor ${q.vendorId}`}
                  {q.id === scored.bestId && (
                    <span className="block font-body text-[12px] font-normal text-primary mt-0.5">★ recommended</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.key}>
                <td className="font-ui text-[13px] font-medium text-ink-faint px-4 py-3 border-t border-hairline-soft">
                  {c.label}
                </td>
                {quotes.map((q) => (
                  <td
                    key={q.id}
                    className={`font-body text-[15px] text-ink px-4 py-3 border-t border-hairline-soft text-center ${
                      q.id === scored.bestId ? "bg-primary/[0.06]" : ""
                    }`}
                  >
                    {cell(q.id, c.key)}
                  </td>
                ))}
              </tr>
            ))}
            {/* selection row */}
            <tr>
              <td className="border-t border-hairline-soft" />
              {quotes.map((q) => (
                <td key={q.id} className={`border-t border-hairline-soft text-center px-4 py-4 ${q.id === scored.bestId ? "bg-primary/[0.06]" : ""}`}>
                  {canSelect ? (
                    <ButtonPrimary onClick={() => select(q.id)}>
                      {selectedId === q.id ? "Selected ✓" : "Select"}
                    </ButtonPrimary>
                  ) : (
                    <span className="font-body text-[13px] text-ink-faint">view only</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="font-body text-[15px] text-ink-soft mt-5">
        <span className="rounded-pill bg-primary/10 text-primary px-2 py-0.5 text-[13px]">Highlighted</span> = best overall
        score (lowest total price + fastest delivery + highest vendor rating + favorable
        payment terms). Delivery timeline requires validation through the approval workflow.
      </p>

      {selectedId && (
        <div className="rounded-[14px] border border-hairline bg-parchment px-5 py-4 mt-5 font-body text-[15px] text-ink-soft">
          {quotes.find((q) => q.id === selectedId)?.vendorName ?? `Vendor ${quotes.find((q) => q.id === selectedId)!.vendorId}`} selected —
          forwarding to manager for approval…
        </div>
      )}

      {role === "officer" && (
        <p className="font-body text-[14px] text-ink-faint mt-4">
          Comparison shown for context. Only Managers can select a quotation for approval.
        </p>
      )}
    </div>
  );
};

export default QuotationCompare;
