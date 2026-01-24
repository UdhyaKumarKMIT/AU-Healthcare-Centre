import * as DashboardService from "../../services/ca/dashboard.service.js";

export const getDashboardCounts = async (req, res) => {
  try {
    const counts = await DashboardService.getDashboardCounts();
    res.status(200).json(counts);
  } catch (err) {
    console.error("Get dashboard counts error:", err);
    res.status(500).json({ 
      message: "Unable to fetch dashboard counts",
      // Return zeros as fallback so frontend won't crash
      dressing_substock_count: 0,
      labtech_substock_count: 0,
      nurse_substock_count: 0,
      pharmacy_substock_count: 0,
      expired_stock_count: 0,
      out_of_stock_count: 0,
      low_stock_count: 0,
    });
  }
};

export const getMedicineTotalStock = async (req, res) => {
  try {
    const medicines = await DashboardService.getMedicineTotalStock();

    res.status(200).json({ medicines });
  } catch (err) {
    console.error("Fetch medicine total stock error:", err);
    res.status(500).json({
      medicines: [], // safe fallback for frontend
      message: "Unable to fetch medicine stock",
    });
  }
};

export const getAllStockDetails = async (req, res) => {
  try {
    const stockData = await DashboardService.getAllStockDetails();

    res.status(200).json(stockData);
  } catch (err) {
    console.error("Fetch all stock details error:", err);
    res.status(500).json({
      pharmacy: [],
      labtech: [],
      nurse: [],
      dressing: [],
      mainStock: [],
      message: "Unable to fetch stock details",
    });
  }
};