import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  TextArea,
  ButtonPrimary,
  ButtonSecondary,
  StatusBadge,
  Table,
  Th,
  Td,
  TextInput,
  FilterTabs,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { inr } from "../data/mock";
import type { ApprovalStatus } from "../types";
import { api } from "../api/client";
import type { BackendApproval } from "../api/client";

const TABS = ["All", "Pending Approval", "Approved", "Rejected"];

const Approvals = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const role = user!.role;

  const [approvals, setApprovals] = useState<BackendApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");

  const loadApprovals = () => {
    if (!token) return;
    setLoading(true);
    api
      .getApprovals(token)
      .then((rows) => {
        setApprovals(rows);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load approvals."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApprovals();
  }, [token]);

  // Vendor cannot see the approval workflow
  if (role === "vendor") {
    return (
      <div>
        <PageHeader title="Approval Workflow" subtitle="Internal process" />
        <div className="rounded-[18px] border border-hairline bg-canvas px-7 py-8 font-body text-[17px] text-ink-soft">
          The internal approval process is hidden from vendor accounts. You will see only
          the final order status.
        </div>
      </div>
    );
  }

  const mapApprovalStatus = (row: BackendApproval): ApprovalStatus => {
    if (row.approval_status === "Approved") return "Approved";
    if (row.approval_status === "Rejected") return "Rejected";
    if (row.quotation_status === "Approved") return "Approved";
    if (row.quotation_status === "Rejected") return "Rejected";
    return "Pending Approval";
  };

  const canDecide = role === "manager" || role === "admin";

  const act = async (quotationId: string, status: "Approved" | "Rejected") => {
    if (status === "Rejected" && !remarks.trim()) {
      setActionError("Remarks are mandatory before rejection.");
      return;
    }
    setActionError("");
    if (!token) return;
    setSaving(true);
    try {
      await api.approveQuotation(token, quotationId, status, remarks);
      loadApprovals();
      setSelectedId(null);
      setRemarks("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to record approval.");
    } finally {
      setSaving(false);
    }
  };

  const selected = approvals.find((a) => String(a.quotation_id) === selectedId);

  const filtered = useMemo(() => {
    return approvals
      .map(a => ({ ...a, computedStatus: mapApprovalStatus(a) }))
      .filter((a) => (tab === "All" ? true : a.computedStatus === tab))
      .filter((a) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return [a.rfq_title, a.vendor_name].join(" ").toLowerCase().includes(s);
      });
  }, [tab, q, approvals]);

  return (
    <div>
      <PageHeader
        title="Approval Workflow"
        subtitle="Review and approve quotations for purchase order generation"
      />

      <div className="mb-4 max-w-[420px]">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search RFQ or Vendor Name..."
        />
      </div>

      <FilterTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && (
        <p className="font-body text-[14px] text-ink-faint mb-3">Loading approvals...</p>
      )}
      {loadError && (
        <p className="font-body text-[14px] text-[#c4313b] mb-3">{loadError}</p>
      )}

      {/* Approvals table */}
      <Table
        head={
          <>
            <Th>RFQ</Th>
            <Th>Vendor</Th>
            <Th>Amount</Th>
            <Th>Quotation Status</Th>
            <Th>Approval</Th>
            <Th>Manager</Th>
            <Th>Actions</Th>
          </>
        }
      >
        {filtered.map((a) => {
          const status = a.computedStatus;
          return (
            <tr key={String(a.quotation_id)}>
              <Td>{a.rfq_title}</Td>
              <Td>{a.vendor_name}</Td>
              <Td>{inr(Number(a.total_amount))}</Td>
              <Td><StatusBadge status={a.quotation_status} /></Td>
              <Td><StatusBadge status={status} /></Td>
              <Td>{a.manager_name || "—"}</Td>
              <Td>
                {status === "Pending Approval" && canDecide ? (
                  <button
                    onClick={() => {
                      setSelectedId(String(a.quotation_id));
                      setRemarks(a.remarks || "");
                      setActionError("");
                    }}
                    className="text-primary cursor-pointer font-body"
                  >
                    Review
                  </button>
                ) : status === "Approved" ? (
                  <button
                    onClick={() => navigate("/invoices")}
                    className="text-primary cursor-pointer font-body"
                  >
                    View PO
                  </button>
                ) : (
                  <span className="font-body text-[13px] text-ink-faint">
                    {a.remarks || "—"}
                  </span>
                )}
              </Td>
            </tr>
          );
        })}
        {!loading && filtered.length === 0 && (
          <tr>
            <td colSpan={7} className="font-body text-[15px] text-ink-soft px-4 py-6 border-t border-hairline-soft text-center">
              {approvals.length === 0 ? "No quotations pending approval." : "No approvals match your filters."}
            </td>
          </tr>
        )}
      </Table>

      {/* Review panel */}
      {selected && (
        <div className="mt-6 rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
            Review: {selected.vendor_name} — {selected.rfq_title}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="font-body text-[15px] text-ink-soft">
                <span className="font-ui text-[13px] text-ink-faint block mb-0.5">Vendor</span>
                <strong className="text-ink">{selected.vendor_name}</strong>
              </div>
              <div className="font-body text-[15px] text-ink-soft">
                <span className="font-ui text-[13px] text-ink-faint block mb-0.5">Amount</span>
                <strong className="text-ink">{inr(Number(selected.total_amount))}</strong>
              </div>
              <div className="font-body text-[15px] text-ink-soft">
                <span className="font-ui text-[13px] text-ink-faint block mb-0.5">Delivery</span>
                <strong className="text-ink">{selected.delivery_timeline || "—"}</strong>
              </div>
            </div>

            {selected.notes && (
              <div className="rounded-[14px] border border-hairline bg-parchment px-5 py-3 mb-4 font-body text-[15px] text-ink-soft">
                <strong className="text-ink">Vendor notes:</strong> {selected.notes}
              </div>
            )}

            <div className="mb-4">
              <label className="block font-ui text-[14px] font-medium text-ink-soft mb-2">
                Approval Remarks <span className="text-ink-faint">(required to reject)</span>
              </label>
              <TextArea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add your comments or conditions..."
              />
            </div>

            {actionError && <p className="font-body text-[14px] text-[#c4313b] mb-3">{actionError}</p>}

            <div className="flex gap-3">
              <ButtonPrimary onClick={() => act(String(selected.quotation_id), "Approved")}>
                {saving ? "Saving..." : "Approve"}
              </ButtonPrimary>
              <ButtonSecondary onClick={() => act(String(selected.quotation_id), "Rejected")}>
                Reject
              </ButtonSecondary>
              <ButtonSecondary onClick={() => { setSelectedId(null); setActionError(""); }}>
                Cancel
              </ButtonSecondary>
            </div>
          </div>
        </div>
      )}

      {role === "officer" && (
        <p className="font-body text-[14px] text-ink-faint mt-4">
          You can track approval status here. Approve / Reject controls are restricted to Manager and Admin roles.
        </p>
      )}
    </div>
  );
};

export default Approvals;
