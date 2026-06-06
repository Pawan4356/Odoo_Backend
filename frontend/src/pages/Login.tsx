import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "../components/layout";
import { ButtonPrimary, Field, TextInput } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import fullLogo from "../assets/full-logo.png";

const Login = () => {
  const { login, setVendorProfile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const session = await api.login(email.trim(), password);
      login(session);

      if (session.user.role === "vendor") {
        try {
          const profile = await api.getMyVendorProfile(session.token);
          if (profile) {
            setVendorProfile(profile);
            navigate("/dashboard");
          } else {
            navigate("/vendor-registration");
          }
        } catch {
          // If fetching profile fails, send to registration as fallback
          navigate("/vendor-registration");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="max-w-[420px] mx-auto">
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="flex flex-col items-center pt-10 pb-6 px-6">
            <img src={fullLogo} alt="Quotor" className="h-20 w-auto object-contain" />
          </div>

          <form onSubmit={submit} className="px-6 pb-8">
            <Field label="Email">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoFocus
              />
            </Field>
            <Field label="Password">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p className="font-body text-[14px] text-[#c4313b] mb-4">{error}</p>
            )}

            <div className="flex justify-center mt-2">
              <ButtonPrimary type="submit">{loading ? "Signing in..." : "Sign in"}</ButtonPrimary>
            </div>
          </form>
        </div>

        <p className="font-body text-[15px] text-ink-soft text-center mt-6">
          New here?{" "}
          <Link to="/register" className="text-primary">Create an account</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;
