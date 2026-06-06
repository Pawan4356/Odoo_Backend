import { useEffect, useState } from "react";
import {
  PageHeader,
  StatCard,
  Table,
  Th,
  Td,
  ButtonSecondary,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { inr } from "../data/mock";
import { api } from "../api/client";
import type { ReportData } from "../api/client";

const Reports = () => {
  const { user, token } = useAuth();
  const role = user!.role;
  const isAdminOrMgr = role === "admin" || role === "manager";

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .getReports(token)
      .then((d) => {
        setData(d);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load reports."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="font-body text-ink-faint">Loading reports...</div>;
  if (loadError) return <p className="font-body text-[14px] text-[#c4313b]">{loadError}</p>;
  if (!data) return <div className="font-body text-ink-faint">No report data available.</div>;

  const { summary, categorySpend, topVendors, monthly } = data;
  const maxCat = Math.max(...categorySpend.map((c) => c.value), 1);
  const maxMonth = Math.max(...monthly.map((m) => m.v), 1);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Procurement Insights"
        action={
          <div className="flex items-center gap-3">
            {isAdminOrMgr && <ButtonSecondary>Export</ButtonSecondary>}
          </div>
        }
      />

      {/* summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total Spend" value={inr(summary.totalSpend)} sub="completed POs" />
        <StatCard label="Active Vendors" value={summary.activeVendors} sub="approved suppliers" />
        <StatCard label="PO Fulfilled %" value={`${summary.poFulfilledPct}%`} sub="completed ÷ total" />
        {isAdminOrMgr && (
          <StatCard label="Pending Issues" value={summary.pendingIssues} sub="approvals + delays" />
        )}
      </div>

      {/* spending by category — horizontal bars */}
      <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mb-4">Spending by category</h2>
      <div className="rounded-[18px] border border-hairline bg-canvas p-6 mb-12">
        {categorySpend.length === 0 && (
          <p className="font-body text-[15px] text-ink-faint text-center py-4">No spending data yet.</p>
        )}
        {categorySpend.map((c) => (
          <div key={c.label} className="flex items-center gap-4 mb-4 last:mb-0">
            <span className="w-[110px] shrink-0 font-ui text-[14px] text-ink-soft">
              {c.label}
            </span>
            <div className="flex-1 bg-parchment rounded-pill h-3 overflow-hidden">
              <div
                className="bg-primary h-full rounded-pill"
                style={{ width: `${(c.value / maxCat) * 100}%` }}
              />
            </div>
            <span className="w-[90px] text-right font-body text-[15px] text-ink">{inr(c.value)}</span>
          </div>
        ))}
      </div>

      {/* top vendors by spend — Admin + Manager only */}
      {isAdminOrMgr ? (
        <>
          <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mb-4">Top vendors by spend</h2>
          <Table
            head={
              <>
                <Th>Vendor Name</Th>
                <Th>Total Spend</Th>
                <Th>POs</Th>
              </>
            }
          >
            {topVendors.map((v) => (
              <tr key={v.name}>
                <Td>{v.name}</Td>
                <Td>{inr(v.spend)}</Td>
                <Td>{v.pos} POs</Td>
              </tr>
            ))}
            {topVendors.length === 0 && (
              <tr>
                <td colSpan={3} className="font-body text-[15px] text-ink-faint px-4 py-6 text-center">
                  No vendor spend data yet.
                </td>
              </tr>
            )}
          </Table>

          <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mt-12 mb-4">
            Monthly procurement trend
          </h2>
          <div className="rounded-[18px] border border-hairline bg-canvas p-6">
            {monthly.length === 0 ? (
              <p className="font-body text-[15px] text-ink-faint text-center py-4">No monthly data yet.</p>
            ) : (
              <div className="flex items-end gap-4 h-[180px]">
                {monthly.map((d) => (
                  <div key={d.m} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="font-ui text-[12px] text-ink-soft mb-2">{d.v > 0 ? inr(d.v) : "0"}</span>
                    <div
                      className="bg-primary rounded-t-[6px] w-full"
                      style={{ height: `${(d.v / maxMonth) * 100}%` }}
                    />
                    <span className="font-ui text-[12px] text-ink-faint mt-2">{d.m}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-[18px] border border-hairline bg-canvas px-7 py-6 font-body text-[17px] text-ink-soft">
          As <strong className="text-ink font-medium">Procurement Officer</strong>, RFQ and PO analytics for your own activity
          are shown above. Organization-wide vendor rankings and the monthly spending trend
          are restricted to Admin and Manager.
        </div>
      )}
    </div>
  );
};

export default Reports;
