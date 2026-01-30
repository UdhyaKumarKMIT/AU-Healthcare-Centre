import React from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;   // OK / Yes
  cancelText?: string;    // No
  onConfirm?: () => void; // if present → confirm modal
}

const CustomModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
}: CustomModalProps) => {
  if (!isOpen) return null;

  const isConfirm = typeof onConfirm === "function";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>{title}</h2>
        <p>{message}</p>

        <div style={buttonRowStyle}>
          {/* CANCEL BUTTON (only for confirm) */}
          {isConfirm && (
            <button onClick={onClose} style={cancelButtonStyle}>
              {cancelText}
            </button>
          )}

          {/* OK / CONFIRM BUTTON */}
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            style={confirmButtonStyle}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const modalStyle: React.CSSProperties = {
  background: "white",
  padding: "2rem",
  borderRadius: 8,
  maxWidth: 400,
  width: "90%",
  textAlign: "center",
};

const buttonRowStyle: React.CSSProperties = {
  marginTop: 20,
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
};

const confirmButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  background: "#1e40af",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
