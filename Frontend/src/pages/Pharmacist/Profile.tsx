import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
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

  const pharmacistId = user?.pharmacist_id;

  // Fetch pharmacist details
  useEffect(() => { 
    if (!pharmacistId) {
      navigate("/login/pharmacist");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/pharmacy/pharmacistDetails", {
          params: { pharmacist_id: pharmacistId }
        });
        setProfile(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch profile. Please login again.");
        navigate("/login/pharmacist");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, pharmacistId]);

  // Handlers
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
  setSaving(true);
  try {
    // Instead of updating DB directly, send a request for change
    /*await api.post("/pharmacy/requestProfileChange", {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });*/

    // Do NOT update local profile immediately
    setIsEditing(false);
    alert("Request for changes sent to Admin");
  } catch (err) {
    console.error(err);
    alert("Failed to send request for changes.");
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

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => navigate("/pharmacist/dashboard", {replace: true})}
            style={iconButtonStyle}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>
            My Profile
          </h1>
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
              >
                {profile.name.charAt(0).toUpperCase() }
              </div>
              <div>
                <h2 style={{ margin: 0, color: "#111827", fontWeight: 600 }}>
                  {toTitleCase(profile.name)}
                </h2> 
              </div>
            </div>

            {!isEditing && (
              <button onClick={handleEdit} style={secondaryButtonStyle}>
                <Pencil size={18} /> Edit Profile
              </button>
            )}
          </div>

          {/* Profile Details / Form */}
          <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            color: "black"
          }}

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
                <LabelField label="Full Name" value={toTitleCase(profile.name)} />
                <LabelField label="Email" value={profile.email} />
                <LabelField label="Phone" value={profile.phone} />
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
  {saving ? "Saving..." : "Request for Changes"}
</button>
            </div>
          )}
        </div>
      </div>
    </div>
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


export default Profile;