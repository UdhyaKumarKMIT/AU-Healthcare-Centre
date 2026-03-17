import { useEffect, useMemo, useState } from "react";
import { CircleUser, FileCheck, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "./CustomModal";
import pageStyles from "../shared/RolePage.module.css";

interface PastPrescription {
    prescription_id: number;
    patient_name: string;
    doctor_name: string;
    name: string; // pharmacist
    issued_at: string;
    specialization: string;
}

interface PrescriptionItem {
    medicine_name: string;
    medicine_type: string;
    total_days: number;
    issued_days: number;
    dosage_per_day: number;
    timing_flags: [number, number, number];
    food_timing: "BEFORE" | "AFTER" | "WITH" | "EMPTY_STOMACH" | null;
}

interface TransactionDetails {
    items?: PrescriptionItem[];
}

const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.substring(1).toLowerCase());

const formatDateTime = (date?: string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    return Number.isNaN(d.getTime())
        ? "Invalid Date"
        : d.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
};

const dateKey = (date?: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
};

const PastPrescriptions = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);

    const [prescriptions, setPrescriptions] = useState<PastPrescription[]>([]);
    const [selected, setSelected] = useState<TransactionDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const [patientName, setPatientName] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [pharmacistName, setPharmacistName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const [filterType, setFilterType] = useState<
        "all" | "patient" | "doctor" | "pharmacist" | "specialization"
    >("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchPast = async () => {
            setLoading(true);
            try {
                const res = await api.get("/pharmacy/transactions");
                setPrescriptions(res.data || []);
            } catch {
                setModalMessage("Could not load past prescriptions.");
                setModalConfirmCallback(null);
                setModalOpen(true);
                toast.error("Could not load past prescriptions");
            } finally {
                setLoading(false);
            }
        };

        fetchPast();
    }, [navigate, user]);

    const filteredPrescriptions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return (prescriptions || []).filter((p) => {
            const matchesDate = filterDate ? dateKey(p.issued_at) === filterDate : true;
            if (!matchesDate) return false;

            if (!term) return true;

            const values = {
                patient: p.patient_name,
                doctor: p.doctor_name,
                pharmacist: p.name,
                specialization: p.specialization,
            };

            if (filterType === "all") {
                return Object.values(values).some((v) => (v || "").toLowerCase().includes(term));
            }

            return (values[filterType] || "").toLowerCase().includes(term);
        });
    }, [filterDate, filterType, prescriptions, searchTerm]);

    return (
        <>
            <CustomModal
                isOpen={modalOpen}
                title="Alert"
                message={modalMessage}
                confirmText="OK"
                onConfirm={modalConfirmCallback ?? undefined}
                onClose={() => setModalOpen(false)}
            />

            <section className={pageStyles.card}>
                <div className={pageStyles.cardHeader}>
                    <h2 className={pageStyles.cardHeaderTitle}>
                        <FileCheck size={20} /> Past Prescriptions
                    </h2>

                    {!selected && (
                        <div className={pageStyles.controls}>
                            <select
                                value={filterType}
                                onChange={(e) =>
                                    setFilterType(
                                        e.target.value as
                                        | "all"
                                        | "patient"
                                        | "doctor"
                                        | "pharmacist"
                                        | "specialization"
                                    )
                                }
                                className={pageStyles.select}
                            >
                                <option value="all">All</option>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="pharmacist">Pharmacist</option>
                                <option value="specialization">Specialization</option>
                            </select>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={filterType === "all" ? "Search" : `Search by ${filterType}`}
                                className={pageStyles.input}
                            />

                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className={pageStyles.input}
                            />

                            {(searchTerm || filterDate || filterType !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterDate("");
                                        setFilterType("all");
                                    }}
                                    className={`${pageStyles.button} ${pageStyles.buttonDanger}`}
                                    type="button"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className={pageStyles.cardBody}>
                    {loading ? (
                        <p className={pageStyles.muted}>Loading past prescriptions...</p>
                    ) : !selected ? (
                        filteredPrescriptions.length === 0 ? (
                            <p className={pageStyles.muted}>No matching prescriptions found.</p>
                        ) : (
                            filteredPrescriptions.map((p) => (
                                <article
                                    key={p.prescription_id}
                                    className={pageStyles.listItem}
                                    role="button"
                                    tabIndex={0}
                                    onClick={async () => {
                                        try {
                                            const res = await api.get(`/pharmacy/transactionDetails/${p.prescription_id}`);
                                            setPatientName(p.patient_name);
                                            setDoctorName(p.doctor_name);
                                            setPharmacistName(p.name);
                                            setSpecialization(p.specialization);
                                            setSelected(res.data);
                                        } catch {
                                            setModalMessage("Could not load prescription details.");
                                            setModalConfirmCallback(null);
                                            setModalOpen(true);
                                            toast.error("Could not load prescription details");
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            (e.currentTarget as HTMLElement).click();
                                        }
                                    }}
                                >
                                    <div className={pageStyles.listItemRow}>
                                        <div className={pageStyles.listItemIcon}>
                                            <CircleUser size={20} />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <p style={{ paddingBottom: 2 }}>
                                                <strong>Patient:</strong> {toTitleCase(p.patient_name)}
                                            </p>
                                            <p style={{ paddingBottom: 2 }}>
                                                <strong>Doctor:</strong> Dr. {toTitleCase(p.doctor_name)}
                                            </p>
                                            <p style={{ paddingBottom: 2 }}>
                                                <strong>Specialization:</strong> {toTitleCase(p.specialization)}
                                            </p>
                                            <p style={{ paddingBottom: 2 }}>
                                                <strong>Pharmacist:</strong> {toTitleCase(p.name)}
                                            </p>
                                            <p style={{ paddingBottom: 2 }}>
                                                <strong>Issued At:</strong> {formatDateTime(p.issued_at)}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )
                    ) : (
                        <div>
                            <p style={{ paddingBottom: 2 }}>
                                <strong>Patient:</strong> {toTitleCase(patientName)}
                            </p>
                            <p style={{ paddingBottom: 2 }}>
                                <strong>Doctor:</strong> {toTitleCase(doctorName)}
                            </p>
                            <p style={{ paddingBottom: 2 }}>
                                <strong>Specialization:</strong> {toTitleCase(specialization)}
                            </p>
                            <p style={{ paddingBottom: 2 }}>
                                <strong>Pharmacist:</strong> {toTitleCase(pharmacistName)}
                            </p>

                            <div style={{ height: 12 }} />

                            {(selected.items || []).length === 0 ? (
                                <p className={pageStyles.muted}>No items found for this prescription.</p>
                            ) : (
                                selected.items?.map((item, idx) => (
                                    <div key={idx} className={pageStyles.detailCard}>
                                        <p style={{ paddingBottom: 2 }}>
                                            <Pill size={18} /> <strong>Medicine:</strong> {toTitleCase(item.medicine_name)} -{" "}
                                            {toTitleCase(item.medicine_type)}
                                        </p>

                                        <p style={{ paddingBottom: 2 }}>
                                            <strong>Prescribed Duration:</strong> {item.total_days} days
                                        </p>
                                        <p style={{ paddingBottom: 2 }}>
                                            <strong>Dispensed Duration:</strong> {item.issued_days} days
                                        </p>
                                        <p style={{ paddingBottom: 2 }}>
                                            <strong>Dosage per day:</strong> {item.dosage_per_day}
                                        </p>

                                        {item.food_timing && (
                                            <p style={{ paddingBottom: 2 }}>
                                                <strong>Food Instruction:</strong>{" "}
                                                {toTitleCase(item.food_timing.replace(/_/g, " "))}
                                            </p>
                                        )}

                                        <div className={pageStyles.checkboxRow}>
                                            <label>
                                                <input type="checkbox" checked={item.timing_flags?.[0] === 1} readOnly /> Morning
                                            </label>
                                            <label>
                                                <input type="checkbox" checked={item.timing_flags?.[1] === 1} readOnly /> Afternoon
                                            </label>
                                            <label>
                                                <input type="checkbox" checked={item.timing_flags?.[2] === 1} readOnly /> Night
                                            </label>
                                        </div>
                                    </div>
                                ))
                            )}

                            <button
                                onClick={() => setSelected(null)}
                                className={`${pageStyles.button} ${pageStyles.buttonPrimary}`}
                                type="button"
                            >
                                ← Back to list
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default PastPrescriptions;
