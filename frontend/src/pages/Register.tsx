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

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("vendor");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <AuthShell>
      <div className="max-w-[640px] mx-auto">
        <form onSubmit={submit}>
          <div className="rounded-[18px] border border-hairline bg-canvas p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field label="First Name">
                <TextInput required placeholder="First name" />
              </Field>
              <Field label="Last Name">
                <TextInput required placeholder="Last name" />
              </Field>
              <Field label="Email">
                <TextInput type="email" required placeholder="you@company.com" />
              </Field>
              <Field label="Phone">
                <TextInput required placeholder="+91 ..." />
              </Field>
              <Field label="Role">
                <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="officer">Procurement Officer</option>
                  <option value="vendor">Vendor</option>
                </Select>
              </Field>
              <Field label="Country">
                <TextInput placeholder="Country" defaultValue="India" />
              </Field>
            </div>


          </div>

          <div className="flex flex-col items-center mt-6">
            {done && (
              <p className="font-body text-[15px] text-ink-soft mb-3">
                Profile created — redirecting to sign in…
              </p>
            )}
            <ButtonPrimary type="submit">Create account</ButtonPrimary>
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
