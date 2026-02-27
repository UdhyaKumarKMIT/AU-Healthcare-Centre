import {
  getPharmacistDetailsService,
  updatePharmacistDetailsService,
  getActivePharmacistStaffByCodeService,
  fetchDashboardCountsService
} from "../../services/pharmacist/pharmacist.service.js";

export const getPharmacistDetails = async (req, res) => {
  const { secret_code } = req.query;
  if (!secret_code) return res.status(400).json({ message: "secret_code query parameter is required" });

  try {
    const staff = await getActivePharmacistStaffByCodeService(secret_code);
    if (!staff) return res.status(401).json({ message: "Invalid secret code" });

    const pharmacist = await getPharmacistDetailsService(staff.staff_id);
    if (!pharmacist) return res.status(404).json({ message: "Pharmacist not found" });
    res.json(pharmacist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch pharmacist details" });
  }
};

export const updatePharmacistDetails = async (req, res) => {
  const { secret_code, name, email, phone } = req.body;
  if (!secret_code) return res.status(400).json({ message: "secret_code is required" });
  if (!name && !email && !phone) return res.status(400).json({ message: "At least one field is required" });

  try {
    const staff = await getActivePharmacistStaffByCodeService(secret_code);
    if (!staff) return res.status(401).json({ message: "Invalid secret code" });

    const affectedRows = await updatePharmacistDetailsService(staff.staff_id, { name, email, phone });
    if (!affectedRows) return res.status(404).json({ message: "Pharmacist not found" });

    const pharmacist = await getPharmacistDetailsService(staff.staff_id);
    if (!pharmacist) return res.status(404).json({ message: "Pharmacist not found" });
    res.json(pharmacist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to update pharmacist details" });
  }
};

export const getDashboardCounts = async (req, res) => {
  try {
    const counts = await fetchDashboardCountsService();
    res.status(200).json(counts);
  } catch (err) {
    console.error("Dashboard count fetch error:", err);
    res.status(500).json({ message: "Unable to fetch dashboard counts" });
  }
};