import { useState } from "react";
import { PageHeader, FilterTabs } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { ACTIVITY } from "../data/mock";
import type { LogCategory } from "../types";

const TABS = ["All", "RFQ", "Approval", "Invoice", "Vendor"];

const ICON: Record<LogCategory, string> = {
  RFQ: "▣",
  Approval: "✓",
  Invoice: "₹",
  Vendor: "☺",
};

const Activity = () => {
  const { user } = useAuth();
  const role = user!.role;
  const [tab, setTab] = useState("All");

  // role pre-scoping (structure.md Screen 10)
  let scoped = ACTIVITY;
  if (role === "manager") scoped = ACTIVITY.filter((l) => l.category === "Approval");
  if (role === "vendor") scoped = ACTIVITY.filter((l) => l.vendorId === "v-1");

  const rows = scoped.filter((l) => (tab === "All" ? true : l.category === tab));

  return (
    <div>
      <PageHeader title="Activity & Logs" subtitle="Procurement audit trail" />

      <FilterTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
        <ul>
          {rows.map((l) => (
            <li key={l.id} className="flex gap-4 px-5 py-4 border-b border-hairline-soft last:border-b-0">
              <span className="rounded-full bg-primary/10 text-primary w-9 h-9 flex items-center justify-center text-[16px] shrink-0">
                {ICON[l.category]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-[15px] font-medium text-ink">{l.title}</p>
                <p className="font-body text-[15px] text-ink-soft">{l.description}</p>
              </div>
              <span className="font-ui text-[13px] text-ink-faint whitespace-nowrap">{l.at}</span>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="px-5 py-8 text-center font-body text-[15px] text-ink-faint">
              No activity in this category.
            </li>
          )}
        </ul>
      </div>

      <p className="font-body text-[14px] text-ink-faint mt-4">
        Records are permanently read-only. Role-based filtering is applied automatically —
        {role === "vendor"
          ? " you see only your own activity."
          : role === "manager"
          ? " you see approval-related activity only."
          : " full audit trail is shown."}
      </p>
    </div>
  );
};

export default Activity;
