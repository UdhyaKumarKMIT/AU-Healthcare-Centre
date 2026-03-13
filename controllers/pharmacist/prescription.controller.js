import {
  getAllPrescriptionsService,
  getPrescriptionDetailsService,
  issueMedicineService
} from "../../services/pharmacist/prescription.service.js";

export const getAllPrescriptions = async (req, res) => {
  try {
    const rows = await getAllPrescriptionsService();
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch prescriptions" });
  }
};

export const getPrescriptionDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const details = await getPrescriptionDetailsService(id);
    res.status(200).json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch prescription details" });
  }
};

export const issueMedicine = async (req, res) => {
  const { pharmacist_id, prescription_id, issued_days, batches, secret_code } = req.body;

  if (!pharmacist_id || !prescription_id || !issued_days || !batches || !batches.length) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await issueMedicineService({ pharmacist_id, prescription_id, issued_days, batches, secret_code });
    res.status(200).json(result);
  } catch (err) {
    console.error("Issue medicine error:", err.message);
    res.status(400).json({ message: err.message });
  }
};
