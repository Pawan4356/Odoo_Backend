import { useState } from "react";
import {
  PageHeader,
  StepIndicator,
  TextArea,
  ButtonPrimary,
  ButtonSecondary,
  StatusBadge,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { APPROVALS, RFQS, vendorName, inr } from "../data/mock";
import type { ApprovalStatus } from "../types";

const STEPS = ["Submitted", "Review", "Approval", "Ordered"];

const Approvals = () => {
  const { user } = useAuth();
  const role = user!.role;

  const pending = APPROVALS.find((a) => a.status === "Pending Approval") ?? APPROVALS[0];
  const [remarks, setRemarks] = useState("");
  const [decision, setDecision] = useState<ApprovalStatus>(pending.status);

  const rfq = RFQS.find((r) => r.id === pending.rfqId);
  const canDecide = role === "manager" && decision === "Pending Approval";

  const currentStep =
    decision === "Approved" ? 4 : decision === "Rejected" ? 3 : 3;

  const act = (next: ApprovalStatus) => {
    if (next === "Rejected" && !remarks.trim()) {
      alert("Remarks are mandatory before rejection.");
      return;
    }
    setDecision(next);
  };

  return (
    <div>
      <PageHeader
        title="Approval Workflow"
        subtitle={`RFQ: ${rfq?.title} · Vendor: ${vendorName(pending.vendorId)} · ${inr(pending.amount)}`}
      />

      {role === "vendor" && (
        <div className="rounded-[18px] border border-hairline bg-canvas px-7 py-8 font-body text-[17px] text-ink-soft">
          The internal approval process is hidden from vendor accounts. You will see only
          the final order status.
        </div>
      )}

      {role !== "vendor" && (
        <>
          <StepIndicator steps={STEPS} current={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* timeline */}
            <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
              <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
                Approval Timeline
              </div>
              <ul className="p-5">
                {pending.timeline.map((t, i) => (
                  <li key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                    <span className="rounded-full bg-ink-faint w-2.5 h-2.5 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-body text-[15px] text-ink">{t.label}</p>
                      <p className="font-ui text-[13px] text-ink-faint">{t.at}</p>
                    </div>
                  </li>
                ))}
                {decision !== "Pending Approval" && (
                  <li className="flex gap-3 relative">
                    <span className="rounded-full bg-primary w-2.5 h-2.5 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-body text-[15px] text-ink">
                        {decision === "Approved" ? "Approved" : "Rejected"} by {user!.name}
                      </p>
                      <p className="font-ui text-[13px] text-ink-faint">just now</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* quotation summary + decision */}
            <div className="space-y-6">
              <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
                <div className="px-5 py-3 border-b border-hairline-soft font-ui text-[14px] font-semibold text-ink">
                  Quotation Summary
                </div>
                <div className="px-5 py-4 font-body text-[15px] text-ink-soft space-y-1 [&_strong]:text-ink [&_strong]:font-medium">
                  <p><strong>Vendor:</strong> {vendorName(pending.vendorId)}</p>
                  <p><strong>Total Amount:</strong> {inr(pending.amount)}</p>
                  <p><strong>Delivery:</strong> 9–12 days</p>
                  <p className="flex items-center gap-2 mt-1">
                    <strong>Status:</strong> <StatusBadge status={decision} />
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-ui text-[14px] font-medium text-ink-soft mb-2">
                  Approval Remarks {role === "manager" && <span className="text-ink-faint">(required to reject)</span>}
                </label>
                <TextArea
                  value={remarks}
                  disabled={!canDecide}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your comments or conditions..."
                />
              </div>

              {role === "manager" ? (
                decision === "Pending Approval" ? (
                  <div className="flex gap-3">
                    <ButtonPrimary onClick={() => act("Approved")}>Approve</ButtonPrimary>
                    <ButtonSecondary onClick={() => act("Rejected")}>Reject</ButtonSecondary>
                  </div>
                ) : (
                  <div className="rounded-[14px] border border-hairline bg-parchment px-5 py-4 font-body text-[15px] text-ink-soft">
                    Decision recorded: <strong className="text-ink font-medium">{decision}</strong>.{" "}
                    {decision === "Approved"
                      ? "Purchase Order generation enabled. Procurement Officer notified."
                      : "Procurement Officer notified to restart."}
                  </div>
                )
              ) : (
                <div className="rounded-[14px] border border-hairline bg-parchment px-5 py-4 font-body text-[15px] text-ink-soft">
                  {role === "officer"
                    ? "You can track approval status and read manager remarks here. Approve / Reject controls are hidden."
                    : "Monitoring view — full approval audit history is available to Admin."}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Approvals;
