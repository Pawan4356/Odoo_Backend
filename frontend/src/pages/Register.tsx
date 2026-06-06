import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "../components/layout";
import {
  ButtonPrimary,
  Field,
  TextInput,
  Select,
} from "../components/ui";
import type { Role } from "../types";
import { api } from "../api/client";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("vendor");
  const [done, setDone] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.register({
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        password,
        role,
      });
      localStorage.setItem("vb.registrationPhone", phone);
      localStorage.setItem("vb.registrationCountry", country);
      setDone(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="max-w-[640px] mx-auto">
        <form onSubmit={submit}>
          <div className="rounded-[18px] border border-hairline bg-canvas p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field label="First Name">
                <TextInput required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
              </Field>
              <Field label="Last Name">
                <TextInput required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
              </Field>
              <Field label="Email">
                <TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </Field>
              <Field label="Phone">
                <TextInput required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
              </Field>
              <Field label="Role">
                <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="manager">Manager</option>
                  <option value="officer">Procurement Officer</option>
                  <option value="vendor">Vendor</option>
                </Select>
              </Field>
              <Field label="Country">
                <TextInput placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </Field>
              <Field label="Password">
                <TextInput type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" />
              </Field>
              <Field label="Confirm Password">
                <TextInput type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
              </Field>
            </div>

            {error && (
              <p className="font-body text-[14px] text-[#c4313b]">{error}</p>
            )}

          </div>

          <div className="flex flex-col items-center mt-6">
            {done && (
              <p className="font-body text-[15px] text-ink-soft mb-3">
                Profile created — redirecting to sign in…
              </p>
            )}
            <ButtonPrimary type="submit">{loading ? "Creating..." : "Create account"}</ButtonPrimary>
            <p className="font-body text-[15px] text-ink-soft mt-4">
              Already registered?{" "}
              <Link to="/login" className="text-primary">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;
