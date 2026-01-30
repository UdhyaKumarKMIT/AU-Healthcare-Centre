import { getTransactionsService, getTransactionDetailsService, getPendingPharmacyStockService, verifyPharmacyStockService } from "../../services/pharmacist/transaction.service.js";

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

export const getVerificationStock = async (req, res) => {
  try {
    const pendingStocks = await getPendingPharmacyStockService();
    res.status(200).json({ pendingStocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch pending pharmacy stocks" });
  }
};

export const verifyPharmacyStock = async (req, res) => {
  try {
    const { batch_no } = req.body;

    if (!batch_no) {
      return res.status(400).json({ message: "Batch number is required" });
    }

    await verifyPharmacyStockService(batch_no);

    res.status(200).json({
      message: `Pharmacy stock for batch ${batch_no} has been verified.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to verify pharmacy stock" });
  }
};