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
import fullLogo from "../assets/full-logo.png";

const Register = () => {
  const navigate = useNavigate();

  // step
  const [step, setStep] = useState<Step>("form");

  // form fields
  const [role, setRole] = useState<Role>("vendor");
  const [done, setDone] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // otp
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // shared
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // ── Step 1: validate form + send OTP ──────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.sendOtp(email.trim()); // POST /api/auth/send-otp
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      // backend sends back {message: "..."} for 409, 400, 500
      setError(err instanceof Error ? err.message : "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP + create account ───────────────────────────────────
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        role,
        otp,
      });
      localStorage.setItem("vb.registrationPhone", phone);
      localStorage.setItem("vb.registrationCountry", country);
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // wrong OTP, expired OTP → show on OTP field
      setOtpError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");
    setLoading(true);
    try {
      await api.sendOtp(email.trim());
      setOtp("");
      startResendCooldown();
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AuthShell>
      <div className="max-w-[640px] mx-auto">
        <form onSubmit={submit}>
          <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden flex flex-col" style={{ maxHeight: "min(520px, 90vh)" }}>
            <div className="flex flex-col items-center pt-10 pb-6 px-6 shrink-0">
              <img src={fullLogo} alt="Quotor" className="h-20 w-auto object-contain" />
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div className="sm:col-span-2">
                  <Field label="Full Name">
                    <TextInput required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
                  </Field>
                </div>
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
                <p className="font-body text-[14px] text-[#c4313b] mt-2">{error}</p>
              )}

              <div className="flex flex-col items-center mt-6 pb-2">
                {done && (
                  <p className="font-body text-[15px] text-ink-soft mb-3">
                    Profile created — redirecting to sign in…
                  </p>
                )}
                <ButtonPrimary type="submit">{loading ? "Creating..." : "Create account"}</ButtonPrimary>
              </div>
            </div>
          </div>

          <p className="font-body text-[15px] text-ink-soft text-center mt-6">
            Already registered?{" "}
            <Link to="/login" className="text-primary">Sign in</Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;