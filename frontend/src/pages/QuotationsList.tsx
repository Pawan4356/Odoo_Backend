import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  Table,
  Th,
  Td,
  TextInput,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import type { RFQ } from "../types";

const QuotationsList = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const role = user!.role;
  const isVendor = role === "vendor";
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .rfqs(token)
      .then((rows) => {
        setRfqs(rows);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load RFQs."))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    return rfqs.filter((r) => {
      const s = q.trim().toLowerCase();
      if (!s) return true;
      return [r.id, r.title, r.category].join(" ").toLowerCase().includes(s);
    });
  }, [q, rfqs]);

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle={
          isVendor
            ? "Your submitted and pending quotations"
            : "Review quotations by RFQ"
        }
      />

      <div className="mb-4 max-w-[420px]">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search RFQ ID, title, or category..."
        />
      </div>

      {loading && (
        <p className="font-body text-[14px] text-ink-faint mb-3">Loading...</p>
      )}
      {loadError && (
        <p className="font-body text-[14px] text-[#c4313b] mb-3">{loadError}</p>
      )}

      <Table
        head={
          <>
            <Th>RFQ ID</Th>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th>Deadline</Th>
            <Th>Vendors</Th>
            <Th>Action</Th>
          </>
        }
      >
        {filtered.map((r) => (
          <tr key={r.id}>
            <Td>{r.id}</Td>
            <Td>{r.title}</Td>
            <Td>{r.category}</Td>
            <Td>{r.deadline}</Td>
            <Td>{isVendor ? "—" : `${r.vendorIds.length} assigned`}</Td>
            <Td>
              <button
                onClick={() =>
                  navigate(isVendor ? "/quotations/submit" : "/quotations/compare", {
                    state: { rfqId: r.id },
                  })
                }
                className="text-primary cursor-pointer font-body"
              >
                {isVendor ? "Submit / View Quote" : "Compare Quotes"}
              </button>
            </Td>
          </tr>
        ))}
        {!loading && filtered.length === 0 && (
          <tr>
            <td colSpan={6} className="font-body text-[15px] text-ink-soft px-4 py-6 border-t border-hairline-soft text-center">
              {rfqs.length === 0 ? "No active RFQs found for quotations." : "No quotations match your search."}
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};

export default QuotationsList;
