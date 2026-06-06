import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { navForRole } from "../auth/nav";
import { ROLE_LABEL } from "../data/mock";

/* ---- Page background: parchment desktop, content sits on it ---- */
export const PageFrame = ({ children }: { children: ReactNode }) => (
  <div className="min-h-full bg-parchment">{children}</div>
);

/* ---- Global nav: ultra-thin true-black bar pinned to the top ---- */
const GlobalNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  return (
    <div className="sticky top-0 z-40 bg-black text-on-dark">
      <div className="mx-auto max-w-[1440px] h-11 px-5 flex items-center justify-between">
        <button
          onClick={() => navigate(user ? "/dashboard" : "/login")}
          className="font-display text-[17px] font-semibold tracking-[-0.01em] text-on-dark cursor-pointer"
        >
          VendorBridge
        </button>
        <div className="flex items-center gap-4">
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="press active:press-active rounded-full bg-white/15 w-7 h-7 flex items-center justify-center font-ui text-[13px] font-medium text-on-dark cursor-pointer"
                title={user.name}
              >
                {user.name.charAt(0)}
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 z-50 bg-canvas rounded-[14px] border border-hairline min-w-[200px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <div className="px-4 py-3 border-b border-hairline-soft">
                    <div className="font-ui text-[15px] font-medium text-ink">
                      {user.name}
                    </div>
                    <div className="font-body text-[13px] text-ink-soft">
                      {ROLE_LABEL[user.role]}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMenu(false);
                      logout();
                      navigate("/login");
                    }}
                    className="w-full text-left font-ui text-[15px] text-primary px-4 py-3 cursor-pointer hover:bg-parchment"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---- Frosted sub-nav: product/role context strip below global nav ---- */
const SubNav = () => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="sticky top-11 z-30 frosted border-b border-hairline">
      <div className="mx-auto max-w-[1440px] h-[52px] px-5 flex items-center justify-between">
        <span className="font-display text-[21px] font-semibold tracking-[-0.01em] text-ink">
          {ROLE_LABEL[user.role]}
        </span>
        <span className="font-ui text-[14px] text-ink-soft">Procurement workspace</span>
      </div>
    </div>
  );
};

/* ---- Left sidebar: role-filtered, active item highlighted ---- */
const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;
  const items = navForRole(user.role);
  return (
    <nav className="w-[220px] shrink-0 hidden md:block py-6 pr-4">
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.key}>
            <NavLink
              to={it.path}
              className={({ isActive }) =>
                `block font-ui text-[15px] px-4 py-2 rounded-[10px] transition-colors ${
                  isActive
                    ? "bg-canvas text-ink font-medium border border-hairline-soft"
                    : "text-ink-soft hover:bg-canvas/60"
                }`
              }
            >
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/* ---- Mobile horizontal nav (sidebar collapses below md) ---- */
const MobileNav = () => {
  const { user } = useAuth();
  if (!user) return null;
  const items = navForRole(user.role);
  return (
    <nav className="md:hidden overflow-x-auto border-b border-hairline bg-canvas/80">
      <ul className="flex gap-1 px-3 py-2 w-max">
        {items.map((it) => (
          <li key={it.key}>
            <NavLink
              to={it.path}
              className={({ isActive }) =>
                `block whitespace-nowrap font-ui text-[14px] px-3 py-1.5 rounded-pill ${
                  isActive ? "bg-primary text-on-primary" : "text-ink-soft"
                }`
              }
            >
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/* ---- Footer: parchment, dense link columns, legal fine print ---- */
const Footer = () => {
  const cols = [
    { head: "Procurement", links: ["RFQs", "Quotations", "Purchase Orders", "Invoices"] },
    { head: "Suppliers", links: ["Vendors", "Onboarding", "Categories", "Ratings"] },
    { head: "Insights", links: ["Reports", "Activity", "Audit Trail", "Exports"] },
    { head: "Support", links: ["Help Center", "Contact", "Status", "Privacy"] },
  ];
  return (
    <footer className="bg-parchment border-t border-hairline mt-12">
      <div className="mx-auto max-w-[1440px] px-5 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {cols.map((c) => (
            <div key={c.head}>
              <div className="font-ui text-[14px] font-semibold text-ink mb-2">
                {c.head}
              </div>
              <ul>
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="font-body text-[14px] text-ink-soft leading-[2] hover:text-ink"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-hairline mt-8 pt-6 font-body text-[12px] text-ink-faint">
          Copyright © 2026 VendorBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

/* ---- Composed shell used by every authenticated screen ---- */
export const AppShell = ({ children }: { children: ReactNode }) => (
  <PageFrame>
    <GlobalNav />
    <SubNav />
    <MobileNav />
    <div className="mx-auto max-w-[1440px] px-5 flex">
      <Sidebar />
      <main className="flex-1 min-w-0 py-8 md:pl-4">{children}</main>
    </div>
    <Footer />
  </PageFrame>
);

/* ---- Bare shell for pre-auth screens (login / register) ---- */
export const AuthShell = ({ children }: { children: ReactNode }) => (
  <PageFrame>
    <GlobalNav />
    <main className="mx-auto max-w-[1440px] px-5 py-12 sm:py-20">{children}</main>
    <Footer />
  </PageFrame>
);
