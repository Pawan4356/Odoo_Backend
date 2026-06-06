import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../components/layout";
import {
  ButtonPrimary,
  ButtonSecondary,
  Field,
  Select,
  TextInput,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { api, ApiError } from "../api/client";
import fullLogo from "../assets/full-logo.png";

const VendorRegistration = () => {
  const navigate = useNavigate();
  const { user, token, setVendorProfile, markVendorProfileComplete } = useAuth();
  const [company, setCompany] = useState(user?.name ?? "");
  const [contact, setContact] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(localStorage.getItem("vb.registrationPhone") ?? "");
  const [gst, setGst] = useState("");
  const [category, setCategory] = useState("Office Supplies");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const profile = await api.registerVendor(token, {
        company_name: company.trim(),
        contact_person: contact.trim() || undefined,
        phone: phone.trim() || undefined,
        gst_details: gst.trim() || undefined,
        category,
      });
      setVendorProfile(profile);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        markVendorProfileComplete();
        setMessage("Vendor profile already exists. Continuing to your dashboard...");
        setTimeout(() => navigate("/dashboard"), 900);
      } else {
        setError(err instanceof Error ? err.message : "Unable to save vendor details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="max-w-[640px] mx-auto">
        <div className="rounded-[18px] border border-hairline bg-canvas overflow-hidden">
          <div className="flex flex-col items-center pt-10 pb-6 px-6">
            <img src={fullLogo} alt="Quotor" className="h-20 w-auto object-contain" />
          </div>

          <form onSubmit={submit} className="px-6 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field label="Company Name">
                <TextInput
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Registered company name"
                  autoFocus
                />
              </Field>
              <Field label="Contact Person">
                <TextInput
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Primary contact"
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 ..."
                />
              </Field>
              <Field label="GST Details">
                <TextInput
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  placeholder="GSTIN"
                />
              </Field>
              <Field label="Category">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>Office Supplies</option>
                  <option>Furniture</option>
                  <option>IT Hardware</option>
                  <option>Logistics</option>
                  <option>Services</option>
                  <option>Other</option>
                </Select>
              </Field>
              <Field label="Email">
                <TextInput value={user?.email ?? ""} disabled />
              </Field>
            </div>

            {error && <p className="font-body text-[14px] text-[#c4313b] mb-4">{error}</p>}
            {message && <p className="font-body text-[15px] text-ink-soft mb-4">{message}</p>}

            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <ButtonSecondary onClick={() => navigate("/login")}>Back</ButtonSecondary>
              <ButtonPrimary type="submit">
                {loading ? "Saving..." : "Complete vendor profile"}
              </ButtonPrimary>
            </div>
          </form>
        </div>
      </div>
    </AuthShell>
  );
};

export default VendorRegistration;
