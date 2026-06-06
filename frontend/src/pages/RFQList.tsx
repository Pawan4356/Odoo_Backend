import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  ButtonPrimary,
  Table,
  Th,
  Td,
  StatusBadge,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { RFQS, VENDORS } from "../data/mock";

const RFQList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user!.role;
  const isVendor = role === "vendor";

  // Vendor sees only RFQs assigned to them (received only)
  const rows = isVendor
    ? RFQS.filter((r) => r.vendorIds.includes("v-1"))
    : RFQS;

  return (
    <div>
      <PageHeader
        title="RFQs"
        subtitle={
          isVendor
            ? "Request for Quotations assigned to you"
            : "Request for Quotations — create, publish and track"
        }
        action={
          role === "officer" && (
            <ButtonPrimary onClick={() => navigate("/rfqs/new")}>+ Create RFQ</ButtonPrimary>
          )
        }
      />

      <Table
        head={
          <>
            <Th>RFQ ID</Th>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th>Deadline</Th>
            <Th>Vendors</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </>
        }
      >
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>{r.id}</Td>
            <Td>{r.title}</Td>
            <Td>{r.category}</Td>
            <Td>{r.deadline}</Td>
            <Td>{isVendor ? "—" : `${r.vendorIds.length} assigned`}</Td>
            <Td><StatusBadge status={r.status} /></Td>
            <Td>
              <button
                onClick={() =>
                  navigate(isVendor ? "/quotations/submit" : "/quotations")
                }
                className="text-primary cursor-pointer font-body"
              >
                {isVendor ? "Submit Quote" : "View Quotes"}
              </button>
            </Td>
          </tr>
        ))}
      </Table>

      <p className="font-body text-[14px] text-ink-faint mt-4">
        {isVendor
          ? "You can only view and respond to RFQs assigned to your account. The creation form is hidden."
          : `${VENDORS.filter((v) => v.status === "Active").length} active vendors available for assignment.`}
      </p>
    </div>
  );
};

export default RFQList;
