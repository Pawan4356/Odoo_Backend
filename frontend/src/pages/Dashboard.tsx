import { useNavigate } from "react-router-dom";
import {
  StatCard,
  Table,
  Th,
  Td,
  StatusBadge,
  ButtonPrimary,
  ButtonSecondary,
  RibbonCard,
  PhotoNotch,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { welcomeFor } from "../auth/nav";
import {
  PURCHASE_ORDERS,
  RFQS,
  VENDORS,
  APPROVALS,
  vendorName,
  inr,
} from "../data/mock";
import type { Role } from "../types";

/* Analytics card visibility per role (structure.md Screen 03) */
const cardVisible = (role: Role, card: string) => {
  const m: Record<string, Role[]> = {
    "Active RFQs": ["admin", "officer", "vendor"],
    "Pending Approvals": ["admin", "manager", "officer"],
    "PO Value This Month": ["admin", "manager", "officer"],
    "Active Vendors": ["admin", "officer"],
  };
  return m[card]?.includes(role);
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const role = user.role;

  const activeRfqs = RFQS.filter((r) => r.status === "Active").length;
  const pendingApprovals = APPROVALS.filter((a) => a.status === "Pending Approval").length;
  const poValue = PURCHASE_ORDERS.reduce(
    (s, p) => s + p.lines.reduce((x, l) => x + l.quantity * l.unitPrice, 0),
    0
  );
  const activeVendors = VENDORS.filter((v) => v.status === "Active").length;

  // Recent PO scoping by role
  const visiblePOs = PURCHASE_ORDERS.filter((p) =>
    role === "vendor" ? p.vendorId === "v-1" : true
  );

  const showChart = role === "admin" || role === "manager";

  return (
    <div>
      <h1 className="font-display text-[34px] sm:text-[44px] font-semibold tracking-[-0.02em] leading-[1.05] text-ink mb-8">
        {welcomeFor(role, user.name)}
      </h1>

      {/* analytics summary cards — one horizontal row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cardVisible(role, "Active RFQs") && (
          <StatCard label="Active RFQs" value={activeRfqs} sub="open for quotation" />
        )}
        {cardVisible(role, "Pending Approvals") && (
          <StatCard label="Pending Approvals" value={pendingApprovals} sub="awaiting decision" />
        )}
        {cardVisible(role, "PO Value This Month") && (
          <StatCard label="PO Value / Month" value={inr(poValue)} sub="issued purchase orders" />
        )}
        {cardVisible(role, "Active Vendors") && (
          <StatCard label="Active Vendors" value={activeVendors} sub="approved suppliers" />
        )}
      </div>

      {/* recent purchase orders */}
      <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mb-4">
        Recent purchase orders
      </h2>
      <Table
        head={
          <>
            <Th>PO Number</Th>
            <Th>Vendor</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </>
        }
      >
        {visiblePOs.map((po) => {
          const amount = po.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
          return (
            <tr key={po.id}>
              <Td>{po.id}</Td>
              <Td>{vendorName(po.vendorId)}</Td>
              <Td>{inr(amount)}</Td>
              <Td><StatusBadge status={po.payment} /></Td>
              <Td>
                <button
                  onClick={() => navigate("/invoices")}
                  className="text-primary cursor-pointer font-body text-[15px]"
                >
                  View PO
                </button>
              </Td>
            </tr>
          );
        })}
      </Table>

      {/* spending trend — Admin + Manager only */}
      {showChart && (
        <div className="mt-12">
          <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mb-4">
            Spending trend
          </h2>
          <MiniBarChart />
        </div>
      )}

      {/* quick actions */}
      <div className="mt-12">
        <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mb-4">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {role === "officer" && (
            <ButtonPrimary onClick={() => navigate("/rfqs/new")}>Create RFQ</ButtonPrimary>
          )}
          {(role === "admin" || role === "officer") && (
            <ButtonSecondary onClick={() => navigate("/vendors")}>Add Vendor</ButtonSecondary>
          )}
          {(role === "admin" || role === "manager") && (
            <ButtonSecondary onClick={() => navigate("/reports")}>View Reports</ButtonSecondary>
          )}
          {role === "vendor" && (
            <ButtonPrimary onClick={() => navigate("/rfqs")}>View Assigned RFQs</ButtonPrimary>
          )}
        </div>
      </div>

      {/* a brand feature panel */}
      <div className="mt-12">
        <RibbonCard
          title="VendorBridge Procurement Suite"
          right={<PhotoNotch label="Suite" />}
        >
          One workspace for RFQs, quotations, approvals, purchase orders and
          invoices — {role === "vendor" ? "respond and get paid faster." : "from request to payment."}
          {" "}Total PO value this month:{" "}
          <strong>{inr(poValue)}</strong>.
        </RibbonCard>
      </div>
    </div>
  );
};

/* Period-accurate flat bar chart (no gradients, hard borders) */
const MiniBarChart = () => {
  const data = [
    { m: "Jan", v: 62 },
    { m: "Feb", v: 48 },
    { m: "Mar", v: 81 },
    { m: "Apr", v: 70 },
    { m: "May", v: 94 },
    { m: "Jun", v: 55 },
  ];
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="rounded-[18px] border border-hairline bg-canvas p-6">
      <div className="flex items-end gap-4 h-[180px]">
        {data.map((d) => (
          <div key={d.m} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="font-ui text-[12px] text-ink-soft mb-2">{d.v}</span>
            <div
              className="bg-primary rounded-t-[6px] w-full"
              style={{ height: `${(d.v / max) * 100}%` }}
            />
            <span className="font-ui text-[12px] text-ink-faint mt-2">{d.m}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
