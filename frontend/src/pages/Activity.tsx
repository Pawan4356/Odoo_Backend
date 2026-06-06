import { useEffect, useState } from "react";
import { PageHeader, FilterTabs } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import type { ActivityItem } from "../api/client";

const TABS = ["All", "RFQ", "Approval", "Invoice", "Vendor"];

const ICON: Record<string, string> = {
  RFQ: "▣",
  Approval: "✓",
  Invoice: "₹",
  Vendor: "☺",
};

const formatDate = (raw: string) => {
  try {
    const d = new Date(raw);
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return raw;
  }
};

const Activity = () => {
  const { user, token } = useAuth();
  const role = user!.role;
  const [tab, setTab] = useState("All");
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .getActivity(token)
      .then((rows) => {
        setItems(rows);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load activity."))
      .finally(() => setLoading(false));
  }, [token]);

  const rows = items.filter((l) => (tab === "All" ? true : l.category === tab));

  return (
    <div>
      <PageHeader title="Activity & Logs" subtitle="Procurement audit trail" />

      <FilterTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && (
        <p className="font-body text-[14px] text-ink-faint mb-3">Loading activity...</p>
      )}
      {loadError && (
        <p className="font-body text-[14px] text-[#c4313b] mb-3">{loadError}</p>
      )}

      <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
        <ul>
          {rows.map((l) => (
            <li key={String(l.id)} className="flex gap-4 px-5 py-4 border-b border-hairline-soft last:border-b-0">
              <span className="rounded-full bg-primary/10 text-primary w-9 h-9 flex items-center justify-center text-[16px] shrink-0">
                {ICON[l.category] ?? "•"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-[15px] font-medium text-ink">{l.title}</p>
                <p className="font-body text-[15px] text-ink-soft">{l.description}</p>
              </div>
              <span className="font-ui text-[13px] text-ink-faint whitespace-nowrap">{formatDate(l.at)}</span>
            </li>
          ))}
          {!loading && rows.length === 0 && (
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
