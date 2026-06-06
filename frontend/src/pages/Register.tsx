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

type Step = "form" | "otp";

const Register = () => {
  const navigate = useNavigate();

  // step
  const [step, setStep] = useState<Step>("form");

  // form fields
  const [role, setRole] = useState<Role>("vendor");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
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

        {/* ── STEP 1: Registration form ── */}
        {step === "form" && (
          <form onSubmit={handleSendOtp}>
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
                <p className="font-body text-[14px] text-[#c4313b] mt-3">{error}</p>
              )}
            </div>

            <div className="flex flex-col items-center mt-6">
              <ButtonPrimary type="submit">
                {loading ? "Sending OTP..." : "Continue"}
              </ButtonPrimary>
              <p className="font-body text-[15px] text-ink-soft mt-4">
                Already registered?{" "}
                <Link to="/login" className="text-primary">Sign in</Link>
              </p>
            </div>
          </form>
        )}

        {/* ── STEP 2: OTP verification ── */}
        {step === "otp" && (
          <form onSubmit={handleRegister}>
            <div className="rounded-[18px] border border-hairline bg-canvas p-6">

              {/* header */}
              <div className="mb-6">
                <h2 className="font-heading text-[18px] text-ink mb-1">
                  Verify your email
                </h2>
                <p className="font-body text-[14px] text-ink-soft">
                  We sent a 6-digit code to{" "}
                  <span className="text-ink font-medium">{email}</span>.
                  Enter it below to complete registration.
                </p>
              </div>

              <Field label="One-Time Password">
                <TextInput
                  required
                  value={otp}
                  onChange={(e) => {
                    // only allow digits, max 6
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(val);
                    setOtpError("");
                  }}
                  placeholder="••••••"
                  autoFocus
                  inputMode="numeric"
                />
              </Field>

              {otpError && (
                <p className="font-body text-[14px] text-[#c4313b] mt-2">{otpError}</p>
              )}

              {/* resend */}
              <div className="mt-4 flex items-center gap-2">
                <span className="font-body text-[14px] text-ink-soft">
                  Didn't receive it?
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="font-body text-[14px] text-primary disabled:text-ink-soft disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center mt-6">
              {done && (
                <p className="font-body text-[15px] text-ink-soft mb-3">
                  Profile created — redirecting to sign in…
                </p>
              )}
              <ButtonPrimary type="submit" disabled={otp.length !== 6 || loading}>
                {loading ? "Verifying..." : "Create account"}
              </ButtonPrimary>
              <button
                type="button"
                onClick={() => { setStep("form"); setOtp(""); setOtpError(""); setError(""); }}
                className="font-body text-[15px] text-ink-soft mt-4 hover:text-ink"
              >
                ← Back to edit details
              </button>
            </div>
          </form>
        )}

      </div>
    </AuthShell>
  );
};

export default Register;