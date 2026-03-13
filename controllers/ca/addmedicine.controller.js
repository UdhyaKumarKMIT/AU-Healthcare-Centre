import xlsx from "xlsx";
import * as AddMedicineService from "../../services/ca/addmedicine.service.js";

export const addSingleMedicine = async (req, res) => {
  try {

    console.log("Incoming request:", req.body);

    const { name, type, batch_no, expiry, quantity } = req.body; 

    if (!name || !type || !batch_no || !expiry || !quantity) {
      return res.status(400).json({
        message: "Missing fields"
      });
    }

    await AddMedicineService.insertMedicines([
      { name, type, batch_no, expiry, quantity }
    ]);

    res.status(201).json({
      message: "Medicine added successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to add medicine"
    });
  }
};


export const addBulkMedicines = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Excel file required"
      });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({
        message: "Excel empty"
      });
    }

    const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    return date_info.toISOString().split("T")[0];
    };

    const medicines = rows.map(row => {

    let expiry = row.expiry;

    // convert excel numeric date
    if (typeof expiry === "number") {
        expiry = excelDateToJSDate(expiry);
    }

    return {
        name: row.name,
        type: row.type?.toUpperCase(),
        batch_no: row.batch_no,
        expiry,
        quantity: Number(row.quantity)
    };

    });

    await AddMedicineService.insertMedicines(medicines);

    res.status(201).json({
      message: `${medicines.length} medicines uploaded`
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Bulk upload failed"
    });

  }

};