import { useEffect, useState } from "react";
import { Pencil, X, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";

/* ---------- Helpers ---------- */
const Profile = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formData, setFormData] = useState({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [secretCode, setSecretCode] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Fetch pharmacist details
  useEffect(() => {
    if (!user) {
      navigate("/login/pharmacist");
      return;
    }
    // Profile is loaded only after the user enters secret code in-page.
    setLoading(false);
  }, [navigate, user]);

  const handleLoadProfile = async () => {
    const normalizedSecretCode = secretCode.trim();
    if (!normalizedSecretCode) {
      setModalMessage("Secret code is required to view profile.");
      setModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/pharmacy/pharmacistDetails", {
        params: { secret_code: normalizedSecretCode }
      });
      setProfile(res.data);
      setFormData(res.data);
      setProfileLoaded(true);
    } catch (err) {
      console.error(err);
      setModalMessage("Failed to fetch profile. Please login again.");
      setModalOpen(true);
      navigate("/login/pharmacist");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalizedSecretCode = secretCode.trim();
      if (!normalizedSecretCode) {
        setModalMessage("Secret code is required to update profile.");
        setModalOpen(true);
        return;
      }

      const res = await api.patch("/pharmacy/updatePharmacistDetails", {
        secret_code: normalizedSecretCode,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      setProfile(res.data);
      setFormData(res.data);
      setIsEditing(false);
      setModalMessage("Profile updated successfully.");
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setModalMessage("Failed to update profile.");
      setModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  if (!profileLoaded) {
    return (
      <>
        <CustomModal
          isOpen={modalOpen}
          title="Alert"
          message={modalMessage}
          confirmText="OK"
          onConfirm={modalConfirmCallback ?? undefined}
          onClose={() => {
            setModalConfirmCallback(null);
            setModalOpen(false);
          }}
        />

        <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "2rem" }}>
          <div style={{ maxWidth: 1200, margin: "auto", padding: "1rem", color: "black" }}>
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#111827" }}>Pharmacist Profile</h2>
              <p style={{ marginTop: 0, color: "#334155" }}>
                Enter your secret code to view and edit profile.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="password"
                  placeholder="Enter secret code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  style={{
                    width: 320,
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.95rem",
                    color: "black",
                    background: "white",
                  }}
                  autoComplete="off"
                />

                <button
                  onClick={handleLoadProfile}
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Load Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomModal
        isOpen={modalOpen}
        title="Alert"
        message={modalMessage}
        confirmText="OK"
        onConfirm={modalConfirmCallback ?? undefined}
        onClose={() => {
          setModalConfirmCallback(null);
          setModalOpen(false);
        }}
      />

      <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "2rem" }}>
        <div style={{
          maxWidth: 1200,
          margin: "auto",
          padding: "1rem",
          color: "black",
        }}>

          {/* Secret Code */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="password"
              placeholder="Enter secret code"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              style={{
                width: 320,
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "0.95rem",
                color: "black",
                background: "white",
              }}
              autoComplete="off"
            />
          </div>

          {/* Profile Card */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Avatar + Edit Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(37,99,235,0.4)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "#111827", fontWeight: "bolder" }}>
                    {toTitleCase(profile.name)}
                  </h2>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span style={roleBadgeStyle}>Pharmacist</span>
                  <span style={statusBadgeStyle}>Active</span>
                </div>
              </div>

              {!isEditing && (
                <button onClick={handleEdit} style={secondaryButtonStyle}>
                  <Pencil size={18} /> Edit Profile
                </button>
              )}
            </div>
            <hr style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              margin: "1.5rem 0"
            }} />

            {/* Profile Details / Form */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.5rem",
                fontFamily: "verdana",
                paddingBottom: "2px"
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #2563eb")}
              onBlur={(e) => (e.target.style.border = "1px solid #e2e8f0")}
            >
              {isEditing ? (
                <>
                  <Input
                    label="Full Name"
                    value={formData.name.charAt(0).toUpperCase() + formData.name.slice(1)}
                    onChange={(v) =>
                      setFormData((f) => ({ ...f, name: v }))
                    }
                  />
                  <Input
                    label="Email"
                    value={formData.email}
                    onChange={(v) =>
                      setFormData((f) => ({ ...f, email: v }))
                    }
                  />
                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(v) =>
                      setFormData((f) => ({ ...f, phone: v }))
                    }
                  />
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: "1.25rem",
                      fontFamily: "verdana"
                    }}
                  >
                    <InfoCard
                      icon={<Pencil size={20} />}
                      label="Full Name"
                      value={toTitleCase(profile.name)}
                    />

                    <InfoCard
                      icon={<Mail size={20} />}
                      label="Email Address"
                      value={profile.email}
                    />

                    <InfoCard
                      icon={<Phone size={20} />}
                      label="Contact Number"
                      value={profile.phone}
                    />
                  </div>

                </>
              )}
            </div>

            {/* Actions */}
            {isEditing && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "2rem",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <button onClick={handleCancel} style={cancelButtonStyle}>
                  <X size={18} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    ...primaryButtonStyle,
                    opacity: saving ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {saving ? "Saving..." : "Submit Update Request"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* Input & LabelField components + button styles */
const Input = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%",
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        fontSize: "0.95rem",
        color: "black",
        background: "white",
        transition: "all 0.2s ease",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#2563eb";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.2)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  </div>
);

const LabelField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</label>
    <p
      style={{
        margin: "0.25rem 0 0",
        fontSize: "0.95rem",
        color: "#1e293b",
        fontWeight: 500,
      }}
    >
      {value}
    </p>
  </div>
);

const iconButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "none",
  color: "black",
  background: "white",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  transition: "transform 0.2s ease",
};

const primaryButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1.5rem",
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transition: "transform 0.2s ease, background 0.3s ease",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1.5rem",
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  fontWeight: 600,
  cursor: "pointer",
  color: "#1e293b",
  transition: "background 0.2s ease, transform 0.2s ease",
};

const cancelButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1.5rem",
  background: "#f3f4f6",
  color: "#374151",
  border: "none",
  borderRadius: "12px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "transform 0.2s ease, background 0.2s ease",
};

const roleBadgeStyle: React.CSSProperties = {
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "0.2rem 0.6rem",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const statusBadgeStyle: React.CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: "0.2rem 0.6rem",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem 1.25rem",
      background: "#f8fafc",
      borderRadius: "14px",
      border: "1px solid #e5e7eb",
      transition: "all 0.25s ease",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = "#f1f5f9")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.background = "#f8fafc")
    }
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: "#e0e7ff",
        color: "#1e40af",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>

    <div>
      <p style={{ margin: 0, fontSize: "1rem", color: "#000000", paddingBottom: "3px", fontWeight: "700" }}>
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "1.1rem",
          fontWeight: 400,
          color: "#111827",
        }}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);


export default Profile;