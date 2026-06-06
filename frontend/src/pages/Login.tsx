import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "../components/layout";
import { ButtonPrimary, Field, TextInput } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { DEMO_USERS_BY_EMAIL } from "../data/mock";
import fullLogo from "../assets/full-logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    const user = DEMO_USERS_BY_EMAIL[email.trim().toLowerCase()];
    if (!user) {
      setError("No account found with that email.");
      return;
    }
    login(user);
    navigate("/dashboard");
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
              <ButtonPrimary type="submit">Sign in</ButtonPrimary>
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
