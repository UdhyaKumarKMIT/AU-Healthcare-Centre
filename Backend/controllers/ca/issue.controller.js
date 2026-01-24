import { issueMedicineService } from "../../services/ca/issue.service.js";

/**
 * Controller to issue medicine
 */
export const issueMedicine = async (req, res) => {
  const { medicine_id, batches } = req.body;

  try {
    await issueMedicineService(medicine_id, batches);

    res.status(200).json({
      success: true,
      message: "Medicine issued successfully",
    });
  } catch (err) {
    console.error("Issue medicine controller error:", err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
