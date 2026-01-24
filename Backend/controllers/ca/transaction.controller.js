import { getTransactionsService, getTransactionDetailsService } from "../../services/ca/transaction.service.js";

export const getTransactions = async (req, res) => {
  try {
    const transactions = await getTransactionsService();
    res.status(200).json(transactions);
  } catch (err) {
    console.error("Fetch all transaction details error:", err);
    res.status(500).json({
      transactions: [], // safe fallback
      message: "Unable to fetch transaction details",
    });
  }
};

export const getTransactionDetails = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ items: [], message: "prescription_id is required" });
  }

  try {
    const items = await getTransactionDetailsService(id);

    res.status(200).json({ items });
  } catch (err) {
    console.error("Fetch prescription details error:", err);
    res.status(500).json({
      items: [], // safe fallback
      message: "Unable to fetch prescription details",
    });
  }
};
