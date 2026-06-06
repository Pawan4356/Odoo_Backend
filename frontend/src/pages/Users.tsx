import { useEffect, useState, useMemo } from "react";
import {
  PageHeader,
  ButtonPrimary,
  ButtonSecondary,
  Table,
  Th,
  Td,
  StatusBadge,
  TextInput,
  FilterTabs,
  Select,
  Field,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";

const TABS = ["All", "Active", "Inactive"];

export default function Users() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);

  // New User Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = () => {
    if (!token) return;
    setLoading(true);
    api.getUsers(token)
      .then((rows) => {
        setUsers(rows);
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const filtered = useMemo(() => {
    return users
      .filter((u) => (tab === "All" ? true : u.status === tab))
      .filter((u) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return [u.name, u.email, u.role].join(" ").toLowerCase().includes(s);
      });
  }, [tab, q, users]);

  const toggleStatus = async (targetId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await api.updateUserStatus(token!, targetId, { status: newStatus });
      setUsers(users.map(u => String(u.id) === String(targetId) ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleResetPassword = async (targetId: string) => {
    const newPassword = prompt("Enter the new password for this user (min 6 chars):");
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      await api.resetPassword(token!, targetId, newPassword);
      alert("Password reset successfully. Please securely communicate the new password to the user.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createUser(token!, { name, email, password, role });
      setCreating(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("Manager");
      loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "admin") {
    return <div className="p-8">Unauthorized. Admin access required.</div>;
  }

  if (creating) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Create New User" subtitle="Add a new procurement officer, manager, or vendor" />
        <form onSubmit={handleCreateUser} className="space-y-4 rounded-[18px] border border-hairline bg-canvas p-6">
          {formError && <p className="font-body text-[14px] text-[#c4313b]">{formError}</p>}
          <Field label="Full Name">
            <TextInput value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <Field label="Email Address">
            <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </Field>
          <Field label="Temporary Password">
            <TextInput type="text" value={password} onChange={e => setPassword(e.target.value)} required />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={e => setRole(e.target.value)}>
              <option value="Manager">Manager</option>
              <option value="Procurement Officer">Procurement Officer</option>
              <option value="Vendor">Vendor</option>
              <option value="Admin">Admin</option>
            </Select>
          </Field>
          <div className="flex gap-4 pt-4">
            <ButtonPrimary type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
            </ButtonPrimary>
            <ButtonSecondary type="button" onClick={() => setCreating(false)}>Cancel</ButtonSecondary>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage user accounts, roles, and access control"
        action={<ButtonPrimary onClick={() => setCreating(true)}>+ Add User</ButtonPrimary>}
      />

      <div className="mb-4 max-w-[420px]">
        <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, role..." />
      </div>

      <FilterTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && <p className="font-body text-[14px] text-ink-faint mb-3">Loading users...</p>}
      {loadError && <p className="font-body text-[14px] text-[#c4313b] mb-3">{loadError}</p>}

      <Table
        head={
          <>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </>
        }
      >
        {filtered.map((u) => (
          <tr key={u.id}>
            <Td>{u.name}</Td>
            <Td>{u.email}</Td>
            <Td><StatusBadge status={u.role} /></Td>
            <Td>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.status === 'Active' ? 'bg-[#e2f5ec] text-[#13613b]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                {u.status}
              </span>
            </Td>
            <Td>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleStatus(u.id, u.status)}
                  className="text-primary cursor-pointer font-body text-[14px]"
                >
                  {u.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleResetPassword(u.id)}
                  className="text-primary cursor-pointer font-body text-[14px]"
                >
                  Reset Password
                </button>
              </div>
            </Td>
          </tr>
        ))}
        {!loading && filtered.length === 0 && (
          <tr>
            <td colSpan={5} className="font-body text-[15px] text-ink-soft px-4 py-6 border-t border-hairline-soft text-center">
              No users found.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}
