import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { canAccessPath } from "./auth/nav";
import { AppShell } from "./components/layout";
import type { ReactNode } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VendorRegistration from "./pages/VendorRegistration";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import RFQList from "./pages/RFQList";
import RFQCreate from "./pages/RFQCreate";
import QuotationSubmit from "./pages/QuotationSubmit";
import QuotationsList from "./pages/QuotationsList";
import QuotationCompare from "./pages/QuotationCompare";
import Approvals from "./pages/Approvals";
import Invoices from "./pages/Invoices";
import Activity from "./pages/Activity";
import Reports from "./pages/Reports";

/* Guard: requires auth; optionally requires the path be in the role's nav. */
const Protected = ({
  children,
  guardPath,
  shell = true,
}: {
  children: ReactNode;
  guardPath?: string;
  shell?: boolean;
}) => {
  const { user, vendorProfileComplete } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (
    user.role === "vendor" &&
    !vendorProfileComplete &&
    location.pathname !== "/vendor-registration"
  ) {
    return <Navigate to="/vendor-registration" replace />;
  }
  if (guardPath && !canAccessPath(user.role, guardPath)) {
    return (
      <AppShell>
        <div className="rounded-[18px] border border-hairline bg-canvas px-8 py-10 font-body text-[17px] text-ink-soft">
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ink mb-3">
            Access restricted
          </h1>
          This module is not available for your role. Use the sidebar to navigate to an
          authorized screen.
        </div>
      </AppShell>
    );
  }
  return shell ? <AppShell>{children}</AppShell> : <>{children}</>;
};

/* Wrapper for VendorRegistration: show in AppShell if editing, bare if first-time */
const VendorRegistrationRoute = () => {
  const { vendorProfileComplete } = useAuth();
  return vendorProfileComplete ? (
    <Protected guardPath="/vendor-registration">
      <VendorRegistration />
    </Protected>
  ) : (
    <Protected shell={false}>
      <VendorRegistration />
    </Protected>
  );
};

import Users from "./pages/Users";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor-registration" element={<VendorRegistrationRoute />} />

        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/vendors" element={<Protected guardPath="/vendors"><Vendors /></Protected>} />
        <Route path="/rfqs" element={<Protected guardPath="/rfqs"><RFQList /></Protected>} />
        <Route path="/rfqs/new" element={<Protected guardPath="/rfqs"><RFQCreate /></Protected>} />
        <Route path="/quotations" element={<Protected guardPath="/quotations"><QuotationsList /></Protected>} />
        <Route path="/quotations/compare" element={<Protected guardPath="/quotations"><QuotationCompare /></Protected>} />
        <Route path="/quotations/submit" element={<Protected guardPath="/quotations"><QuotationSubmit /></Protected>} />
        <Route path="/approvals" element={<Protected guardPath="/approvals"><Approvals /></Protected>} />
        <Route path="/invoices" element={<Protected guardPath="/invoices"><Invoices /></Protected>} />
        <Route path="/activity" element={<Protected guardPath="/activity"><Activity /></Protected>} />
        <Route path="/reports" element={<Protected guardPath="/reports"><Reports /></Protected>} />
        <Route path="/users" element={<Protected><Users /></Protected>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
