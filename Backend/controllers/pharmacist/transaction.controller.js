import { getTransactionsService, getTransactionDetailsService } from "../../services/pharmacist/transaction.service.js";

export const getTransactions = async (req, res) => {
  try {
    const transactions = await getTransactionsService();
    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch transaction details" });
  }
};

export const getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await getTransactionDetailsService(id);
    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch prescription details" });
  }
};
