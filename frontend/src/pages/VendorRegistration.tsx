import { useState, useEffect } from "react";
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
  const { user, token, vendorProfile, vendorProfileComplete, setVendorProfile, markVendorProfileComplete } = useAuth();

  const isEditMode = vendorProfileComplete;

  const [company, setCompany] = useState(vendorProfile?.name ?? user?.name ?? "");
  const [contact, setContact] = useState(vendorProfile?.contact ?? user?.name ?? "");
  const [phone, setPhone] = useState(vendorProfile?.phone ?? localStorage.getItem("vb.registrationPhone") ?? "");
  const [gst, setGst] = useState(vendorProfile?.gst ?? "");
  const [category, setCategory] = useState(vendorProfile?.category || "Office Supplies");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // When entering edit mode, fetch the latest profile from backend
  useEffect(() => {
    if (isEditMode && token) {
      api.getMyVendorProfile(token).then((profile) => {
        if (profile) {
          setCompany(profile.name);
          setContact(profile.contact);
          setPhone(profile.phone);
          setGst(profile.gst);
          setCategory(profile.category || "Office Supplies");
        }
      }).catch(() => {
        // silently fallback to cached values
      });
    }
  }, [isEditMode, token]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      company_name: company.trim(),
      contact_person: contact.trim() || undefined,
      phone: phone.trim() || undefined,
      gst_details: gst.trim() || undefined,
      category,
    };

    try {
      if (isEditMode) {
        // Update existing profile
        const profile = await api.updateVendorProfile(token, payload);
        setVendorProfile(profile);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        // Create new profile
        const profile = await api.registerVendor(token, payload);
        setVendorProfile(profile);
        navigate("/dashboard");
      }
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

  const formContent = (
    <div className={isEditMode ? "" : "max-w-[640px] mx-auto"}>
      <div className={`rounded-[18px] border border-hairline bg-canvas overflow-hidden ${isEditMode ? "" : ""}`}>
        {!isEditMode && (
          <div className="flex flex-col items-center pt-10 pb-6 px-6">
            <img src={fullLogo} alt="Quotor" className="h-20 w-auto object-contain" />
          </div>
        )}

        {isEditMode && (
          <div className="px-6 pt-6 pb-2">
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ink">
              Vendor Profile
            </h1>
            <p className="font-body text-[15px] text-ink-soft mt-1">
              Update your company and contact details below.
            </p>
          </div>
        )}

        <form onSubmit={submit} className="px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Field label="Company Name">
              <TextInput
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Registered company name"
                autoFocus={!isEditMode}
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
          {message && <p className="font-body text-[15px] text-[#2d8a4e] mb-4">{message}</p>}

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {!isEditMode && (
              <ButtonSecondary onClick={() => navigate("/login")}>Back</ButtonSecondary>
            )}
            <ButtonPrimary type="submit">
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update profile"
                  : "Complete vendor profile"}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );

  // In edit mode the page renders inside AppShell (handled by route guard),
  // so we just return the form content directly.
  // In initial registration mode we wrap in AuthShell.
  if (isEditMode) {
    return formContent;
  }

  return <AuthShell>{formContent}</AuthShell>;
};

export default VendorRegistration;
