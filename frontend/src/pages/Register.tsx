import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "../components/layout";
import {
  ButtonPrimary,
  Field,
  TextInput,
  Select,
  TextArea,
} from "../components/ui";
import type { Role } from "../types";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("vendor");
  const [photo, setPhoto] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => navigate("/login"), 1200);
  };

  const additionalHint =
    role === "vendor"
      ? "Company name, GST details, vendor category, business address…"
      : "Department, employee ID, designation…";

  return (
    <AuthShell>
      <div className="max-w-[760px] mx-auto">
        <h1 className="font-display text-[40px] font-semibold tracking-[-0.02em] text-ink leading-[1.05] text-center mb-2">
          Create your account
        </h1>
        <p className="font-body text-[17px] text-ink-soft text-center mb-8">
          Onboard to VendorBridge — your role is assigned on registration.
        </p>

        <form onSubmit={submit}>
          <div className="rounded-[18px] border border-hairline bg-canvas p-8">
            {/* profile photo upload, top-center */}
            <div className="flex flex-col items-center mb-8">
              <div className="rounded-full bg-parchment border border-hairline w-20 h-20 overflow-hidden flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-ui text-[13px] text-ink-faint">Photo</span>
                )}
              </div>
              <label className="mt-3 cursor-pointer">
                <span className="font-ui text-[14px] text-primary">
                  {photo ? "Replace photo" : "Upload photo"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              </label>
            </div>

            {/* two-column form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Field label="First Name">
                <TextInput required placeholder="First name" />
              </Field>
              <Field label="Last Name">
                <TextInput required placeholder="Last name" />
              </Field>
              <Field label="Email Address">
                <TextInput type="email" required placeholder="you@company.com" />
              </Field>
              <Field label="Phone Number">
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

            <Field label="Additional Information" hint={additionalHint}>
              <TextArea placeholder={additionalHint} />
            </Field>
          </div>

          {/* register button outside + below the form container */}
          <div className="flex flex-col items-center mt-8">
            {done && (
              <p className="font-body text-[15px] text-ink-soft mb-3">
                Profile created — redirecting to sign in…
              </p>
            )}
            <ButtonPrimary type="submit">Create account</ButtonPrimary>
            <p className="font-body text-[15px] text-ink-soft mt-4">
              Already registered?{" "}
              <Link to="/login" className="text-primary">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;
