import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "../components/layout";
import { ButtonPrimary, CertSeal, Field, TextInput } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { DEMO_USERS } from "../data/mock";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    // Front-end demo: map a known demo username → role-based account.
    const key = username.trim().toLowerCase();
    const user = DEMO_USERS[key];
    if (!user) {
      setError("Invalid credentials. Try: admin, manager, officer, or vendor.");
      return;
    }
    login(user); // role identified → automatic redirect to the dashboard
    navigate("/dashboard");
  };

  return (
    <AuthShell>
      <div className="max-w-[420px] mx-auto">
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          {/* branding / profile area */}
          <div className="flex flex-col items-center pt-10 pb-6 px-6">
            <div className="rounded-full bg-parchment border border-hairline w-16 h-16 flex items-center justify-center">
              <span className="font-display text-[22px] font-semibold text-ink">VB</span>
            </div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ink mt-4 leading-none">
              Sign in
            </h1>
            <p className="font-body text-[15px] text-ink-soft mt-2">
              VendorBridge Procurement
            </p>
          </div>

          <form onSubmit={submit} className="px-6 pb-8">
            <Field label="Username">
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="registered username or email"
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
              <ButtonPrimary type="submit">Sign in</ButtonPrimary>
            </div>
          </form>
        </div>

        {/* demo credentials helper */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="rounded-[18px] border border-hairline bg-canvas px-5 py-4 flex-1">
            <p className="font-ui text-[13px] font-medium text-ink-soft mb-1">
              Demo accounts (any password)
            </p>
            <p className="font-body text-[14px] text-ink leading-relaxed">
              <code className="text-primary">admin</code> ·{" "}
              <code className="text-primary">manager</code> ·{" "}
              <code className="text-primary">officer</code> ·{" "}
              <code className="text-primary">vendor</code>
            </p>
          </div>
          <CertSeal />
        </div>

        <p className="font-body text-[15px] text-ink-soft text-center mt-6">
          New here?{" "}
          <Link to="/register" className="text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;
