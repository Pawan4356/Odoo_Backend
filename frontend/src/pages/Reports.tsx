import {
  PageHeader,
  StatCard,
  Table,
  Th,
  Td,
  ButtonSecondary,
  Select,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { inr } from "../data/mock";

const CATEGORY_SPEND = [
  { label: "IT Hardware", value: 480000 },
  { label: "Furniture", value: 320000 },
  { label: "Logistics", value: 230000 },
  { label: "Stationery", value: 210000 },
];

const TOP_VENDORS = [
  { name: "TechCore Ltd", spend: 420000, pos: 6 },
  { name: "Infra Supplies", spend: 264500, pos: 4 },
  { name: "Office Mart Corp", spend: 158000, pos: 5 },
];

const MONTHLY = [
  { m: "Jan", v: 62 },
  { m: "Feb", v: 48 },
  { m: "Mar", v: 81 },
  { m: "Apr", v: 70 },
  { m: "May", v: 94 },
];

const Reports = () => {
  const { user } = useAuth();
  const role = user!.role;
  const isAdminOrMgr = role === "admin" || role === "manager";
  const maxCat = Math.max(...CATEGORY_SPEND.map((c) => c.value));
  const maxMonth = Math.max(...MONTHLY.map((m) => m.v));

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Procurement Insights — May 2026"
        action={
          <div className="flex items-center gap-3">
            <div className="w-[140px]">
              <Select defaultValue="May 2026">
                <option>May 2026</option>
                <option>Q2 2026</option>
                <option>FY 2026</option>
              </Select>
            </div>
            {isAdminOrMgr && <ButtonSecondary>Export</ButtonSecondary>}
          </div>
        }
      />

      {/* summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total Spend" value={inr(1240000)} sub="completed POs" />
        <StatCard label="Active Vendors" value={28} sub="approved suppliers" />
        <StatCard label="PO Fulfilled %" value="94%" sub="completed ÷ total" />
        {isAdminOrMgr && (
          <StatCard label="Pending Issues" value={3} sub="approvals + delays" />
        )}
      </div>

      {/* spending by category — horizontal bars */}
      <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mb-4">Spending by category</h2>
      <div className="rounded-[18px] border border-hairline bg-canvas p-6 mb-12">
        {CATEGORY_SPEND.map((c) => (
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
            {TOP_VENDORS.map((v) => (
              <tr key={v.name}>
                <Td>{v.name}</Td>
                <Td>{inr(v.spend)}</Td>
                <Td>{v.pos} POs</Td>
              </tr>
            ))}
          </Table>

          <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mt-12 mb-4">
            Monthly procurement trend
          </h2>
          <div className="rounded-[18px] border border-hairline bg-canvas p-6">
            <div className="flex items-end gap-4 h-[180px]">
              {MONTHLY.map((d) => (
                <div key={d.m} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="font-ui text-[12px] text-ink-soft mb-2">{d.v}</span>
                  <div
                    className="bg-primary rounded-t-[6px] w-full"
                    style={{ height: `${(d.v / maxMonth) * 100}%` }}
                  />
                  <span className="font-ui text-[12px] text-ink-faint mt-2">{d.m}</span>
                </div>
              ))}
            </div>
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
