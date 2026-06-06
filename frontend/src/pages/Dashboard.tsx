import { useEffect, useState } from "react";
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
import { inr } from "../data/mock";
import type { Role, RFQ } from "../types";
import { api } from "../api/client";
import type { RichPO, BackendApproval } from "../api/client";

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
  const { user, token, vendorProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [vendorCount, setVendorCount] = useState(0);
  const [purchaseOrders, setPurchaseOrders] = useState<RichPO[]>([]);
  const [approvals, setApprovals] = useState<BackendApproval[]>([]);
  const role = user?.role ?? "vendor";

  useEffect(() => {
    if (!token) return;
    // Fetch POs for all roles
    api.purchaseOrders(token).then((rows) => setPurchaseOrders(rows)).catch(() => undefined);
    // Fetch RFQs for all roles (backend filters for vendor)
    api.rfqs(token).then((rows) => setRfqs(rows)).catch(() => undefined);
    // Fetch vendors count for non-vendor roles
    if (role !== "vendor") {
      api.vendors(token).then((rows) => setVendorCount(rows.filter((v) => v.status === "Active").length)).catch(() => undefined);
    }
    // Fetch approvals for admin/manager/officer
    if (role !== "vendor") {
      api.getApprovals(token).then((rows) => setApprovals(rows)).catch(() => undefined);
    }
  }, [role, token]);

  if (!user) return null;

  const activeRfqs = rfqs.filter((r) => r.status === "Active").length;
  const pendingApprovals = approvals.filter((a) => !a.approval_status || a.approval_status === "Pending").length;
  const poValue = purchaseOrders.reduce(
    (s, p) => s + p.lines.reduce((x, l) => x + l.quantity * l.unitPrice, 0),
    0
  );

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
          <StatCard label="Active Vendors" value={vendorCount} sub="approved suppliers" />
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
        {purchaseOrders.map((po) => {
          const amount = po.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
          return (
            <tr key={po.id}>
              <Td>{po.rfqTitle || po.id}</Td>
              <Td>{po.vendorName}</Td>
              <Td>{inr(amount)}</Td>
              <Td><StatusBadge status={po.payment} /></Td>
              <Td>
                <button
                  onClick={() => navigate("/invoices", { state: { rfqId: po.rfqId } })}
                  className="text-primary cursor-pointer font-body text-[15px]"
                >
                  View PO
                </button>
              </Td>
            </tr>
          );
        })}
        {purchaseOrders.length === 0 && (
          <tr>
            <td colSpan={5} className="font-body text-[15px] text-ink-soft px-4 py-6 text-center">
              No purchase orders yet.
            </td>
          </tr>
        )}
      </Table>

      {/* spending trend — Admin + Manager only */}
      {(role === "admin" || role === "manager") && (
        <div className="mt-12">
          <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink mb-4">
            Spending trend
          </h2>
          <MiniBarChart token={token!} />
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
          {role === "vendor" && !vendorProfileComplete && (
            <ButtonSecondary onClick={() => navigate("/vendor-registration")}>Complete Vendor Profile</ButtonSecondary>
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

/* Dynamic bar chart from reports API */
const MiniBarChart = ({ token }: { token: string }) => {
  const [data, setData] = useState<{ m: string; v: number }[]>([]);
  useEffect(() => {
    api.getReports(token).then((d) => setData(d.monthly)).catch(() => undefined);
  }, [token]);

  if (data.length === 0) {
    return (
      <div className="rounded-[18px] border border-hairline bg-canvas p-6">
        <p className="font-body text-[15px] text-ink-faint text-center py-4">No spending data yet.</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div className="rounded-[18px] border border-hairline bg-canvas p-6">
      <div className="flex items-end gap-4 h-[180px]">
        {data.map((d) => (
          <div key={d.m} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="font-ui text-[12px] text-ink-soft mb-2">{d.v > 0 ? inr(d.v) : "0"}</span>
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
