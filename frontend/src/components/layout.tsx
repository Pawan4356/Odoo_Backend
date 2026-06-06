import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { navForRole } from "../auth/nav";
import { ROLE_LABEL } from "../data/mock";
import fullLogo from "../assets/full-logo.png";

export const PageFrame = ({ children }: { children: ReactNode }) => (
  <div className="min-h-full bg-parchment">{children}</div>
);

/* ---- Black full-height sidebar ---- */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const items = navForRole(user.role);

  return (
    <aside className="w-[220px] shrink-0 hidden md:flex flex-col bg-black h-screen sticky top-0">
      {/* Logo */}
      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 py-4 cursor-pointer"
        aria-label="Quotor home"
      >
        <img src={fullLogo} alt="Quotor" className="h-12 w-auto object-contain invert" />
      </button>

      {/* Nav items — scrollable if many */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {items.map((it) => (
            <li key={it.key}>
              <NavLink
                to={it.path}
                className={({ isActive }) =>
                  `block font-ui text-[14px] px-3 py-2 rounded-[8px] transition-colors ${
                    isActive
                      ? "bg-white/15 text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                {it.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User profile + sign out at the bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-[13px] font-medium text-white shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-ui text-[13px] text-white truncate">{user.name}</span>
              <span className="font-body text-[11px] text-white/50 truncate">{ROLE_LABEL[user.role]}</span>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="rounded-[6px] bg-white/10 hover:bg-white/20 text-white text-[12px] font-ui font-medium px-3 py-1.5 shrink-0 cursor-pointer transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

/* ---- Mobile top nav (sidebar collapses below md) ---- */
const MobileNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const items = navForRole(user.role);

  return (
    <div className="md:hidden bg-black text-white">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src={fullLogo} alt="Quotor" className="h-8 w-auto object-contain invert" />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="rounded-[6px] bg-white/10 hover:bg-white/20 text-white text-[13px] font-ui font-medium px-3 py-1 cursor-pointer transition-colors"
          >
            Sign out
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="font-ui text-[13px] text-white/80 cursor-pointer"
          >
            {open ? "✕" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="px-3 pb-3 border-t border-white/10">
          <ul className="space-y-0.5 pt-2">
            {items.map((it) => (
              <li key={it.key}>
                <NavLink
                  to={it.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block font-ui text-[14px] px-3 py-2 rounded-[8px] ${
                      isActive ? "bg-white/15 text-white font-medium" : "text-white/60"
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

/* ---- Composed shell: sidebar fixed, main scrolls ---- */
export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <MobileNav />
      <main className="flex-1 overflow-y-auto bg-parchment">
        <div className="max-w-[1100px] mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  </div>
);

/* ---- Bare shell for pre-auth screens (login / register) ---- */
export const AuthShell = ({ children }: { children: ReactNode }) => (
  <PageFrame>
    <main className="mx-auto max-w-[1440px] px-5 py-12 sm:py-20">{children}</main>
  </PageFrame>
);
