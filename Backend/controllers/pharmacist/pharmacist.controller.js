import {
  getPharmacistDetailsService,
  updatePharmacistDetailsService,
  fetchDashboardCountsService
} from "../../services/pharmacist/pharmacist.service.js";

export const getPharmacistDetails = async (req, res) => {
  const { pharmacist_id } = req.query;
  if (!pharmacist_id) return res.status(400).json({ message: "pharmacist_id query parameter is required" });

  try {
    const pharmacist = await getPharmacistDetailsService(pharmacist_id);
    if (!pharmacist) return res.status(404).json({ message: "Pharmacist not found" });
    res.json(pharmacist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch pharmacist details" });
  }
};

export const updatePharmacistDetails = async (req, res) => {
  const { pharmacist_id, name, email, phone } = req.body;
  if (!pharmacist_id) return res.status(400).json({ message: "pharmacist_id is required" });
  if (!name && !email && !phone) return res.status(400).json({ message: "At least one field is required" });

  try {
    const affectedRows = await updatePharmacistDetailsService(pharmacist_id, { name, email, phone });
    if (!affectedRows) return res.status(404).json({ message: "Pharmacist not found" });
    res.json({ message: "Pharmacist details updated successfully" });
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