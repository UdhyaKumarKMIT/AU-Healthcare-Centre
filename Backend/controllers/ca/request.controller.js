import { getRequestsService, getRequestDetailsService } from "../../services/ca/request.service.js";

export const getRequests = async (req, res) => {
  try {
    const requests = await getRequestsService();

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch pending prescriptions error:", err);
    res.status(500).json({
      requests: [], // safe fallback
      message: "Unable to fetch prescriptions",
    });
  }
};

export const getRequestDetails = async (req, res) => {
  const { id } = req.query; // medicine_id

  if (!id) {
    return res.status(400).json({ message: "medicine_id is required" });
  }

  try {
    const batches = await getRequestDetailsService(id);

    res.status(200).json({ batches });
  } catch (err) {
    console.error("Fetch batch details error:", err);
    res.status(500).json({
      batches: [], // safe fallback
      message: "Unable to fetch batch details",
    });
  }
};
