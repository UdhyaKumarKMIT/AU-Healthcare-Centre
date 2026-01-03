import * as doctorService from '../services/doctor.service.js';

export const getDoctorVisits = async (req, res, next) => {
  try {
    const doctor_id = req.query.doctor_id;
    
    console.log('👨‍⚕️ Doctor ID from query:', doctor_id);
    
    if (!doctor_id) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id query parameter is required'
      });
    }
    
    const visits = await doctorService.getActiveDoctorVisits(doctor_id);
    
    console.log('✅ Visits found:', visits.length);
    
    res.json({
      success: true,
      data: visits
    });
  } catch (e) {
    console.error('❌ Error:', e);
    next(e);
  }
};

export const addDiagnosis = async (req, res, next) => {
  try {
    await doctorService.addDiagnosis(req.body);
    res.status(201).json({ success: true, message: 'Diagnosis added' });
  } catch (e) {
    next(e);
  }
};

export const addPrescription = async (req, res, next) => {
  try {
    console.log("🔥 prescription controller hit");
    console.log("📥 body:", req.body);

    const { visit_id, doctor_id, medicines } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "No medicines sent" });
    }
    console.log("📥 Prescription received:", req.body);

    const result = await doctorService.createPrescription({
      visit_id,
      doctor_id,
      meds: medicines
    });

    res.status(201).json({
      success: true,
      message: "Prescription saved",
      prescriptionId: result.prescription_id
    });

  } catch (err) {
    next(err);
  }
};

export const updateVisitStatus = async (req, res, next) => {
  try {
    const { visit_id } = req.params;
    const { status } = req.body;

    console.log('🔄 Updating visit status:', { visit_id, status });

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required in request body'
      });
    }

    const result = await doctorService.updateVisitStatus({
      visit_id,
      newStatus: status
    });

    res.json({
      success: true,
      message: `Visit status updated to ${status}`,
      data: result
    });
  } catch (e) {
    console.error('❌ Error updating visit status:', e);
    
    if (e.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        message: e.message
      });
    }
    
    if (e.message === 'Visit not found') {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }
    
    next(e);
  }
};

export const completeVisit = async (req, res, next) => {
  try {
    await doctorService.updateVisitStatus({
      visit_id: req.params.visit_id,
      newStatus: 'COMPLETED'
    });
    res.json({ success: true, message: 'Visit completed' });
  } catch (e) {
    next(e);
  }
};