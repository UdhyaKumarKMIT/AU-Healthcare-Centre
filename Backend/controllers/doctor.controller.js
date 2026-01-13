import * as doctorService from '../services/doctor.service.js';

export const getDoctorQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    
    console.log('👨‍⚕️ Doctor ID from params:', doctorId);
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId parameter is required'
      });
    }
    
    const visits = await doctorService.getActiveDoctorVisits(doctorId);
    
    console.log('✅ Queue visits found:', visits.length);
    
    res.json({
      success: true,
      data: visits
    });
  } catch (e) {
    console.error('❌ Error fetching queue:', e);
    next(e);
  }
};

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

export const getPatientHistory = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    
    console.log('📜 Fetching history for patient:', patient_id);
    
    const history = await doctorService.getPatientHistory(patient_id);
    
    res.json({
      success: true,
      data: history
    });
  } catch (e) {
    console.error('❌ Error fetching patient history:', e);
    next(e);
  }
};

export const searchMedicines = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    const medicines = await doctorService.searchMedicines(search);
    
    res.json({
      success: true,
      data: medicines
    });
  } catch (e) {
    console.error('❌ Error searching medicines:', e);
    next(e);
  }
};

export const getAvailableNurses = async (req, res, next) => {
  try {
    const nurses = await doctorService.getAvailableNurses();
    
    console.log('✅ Found', nurses.length, 'nurses');
    
    res.json({
      success: true,
      nurses: nurses,
      count: nurses.length
    });
  } catch (e) {
    console.error('❌ Error fetching nurses:', e);
    next(e);
  }
};

export const createPrescriptionWithTasks = async (req, res, next) => {
  try {
    console.log('🔥 prescription-with-tasks controller hit');
    console.log('📥 body:', req.body);

    const { visit_id, doctor_id, medicines } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No medicines provided' 
      });
    }

    const result = await doctorService.createPrescriptionWithTasks({
      visit_id,
      doctor_id,
      medicines
    });

    res.status(201).json({
      success: true,
      message: 'Prescription saved successfully',
      data: result
    });

  } catch (err) {
    console.error('❌ Error creating prescription with tasks:', err);
    next(err);
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

export const getTodayVisitsCount = async (req, res, next) => {
  try {
    const { doctor_id, date } = req.query;
    
    if (!doctor_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'doctor_id and date parameters are required'
      });
    }

    const Visit = (await import('../models/sequelize/index.js')).Visit;
    const { Op } = await import('sequelize');

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Visit.count({
      where: {
        doctor_id,
        visit_date: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    res.json({
      success: true,
      count: count,
      date: date,
      doctor_id: doctor_id
    });

  } catch (error) {
    console.error('❌ Error fetching today\'s visits:', error);
    next(error);
  }
};