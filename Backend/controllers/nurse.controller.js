import * as nurseService from '../services/nurse.service.js';

export const getNurseTasks = async (req, res, next) => {
  try {
    const { staff_code } = req.user; // From auth middleware
    const tasks = await nurseService.getNurseTasks(staff_code);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTaskDetails = async (req, res, next) => {
  try {
    const { task_id } = req.params;
    const details = await nurseService.getTaskDetails(task_id);
    res.json(details);
  } catch (err) {
    next(err);
  }
};

export const getCompletedTaskDetails = async (req, res, next) => {
  try {
    const { task_id } = req.params;
    const details = await nurseService.getCompletedTaskDetails(task_id);
    res.json(details);
  } catch (err) {
    next(err);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { task_id } = req.params;
    const { observation, medications_used, remarks, secret_code, ecg_report } = req.body;
    
    console.log('🔍 [COMPLETE TASK] Request received');
    console.log('🔍 [COMPLETE TASK] Task ID:', task_id);
    console.log('🔍 [COMPLETE TASK] Request body:', {
      has_observation: !!observation,
      has_medications: !!medications_used,
      medications_count: medications_used?.length,
      has_remarks: !!remarks,
      has_secret_code: !!secret_code,
      secret_code_value: secret_code,
      secret_code_type: typeof secret_code,
      has_ecg_report: !!ecg_report
    });
    
    // Verify secret code exists in database as an active NURSE_RECEPTIONIST
    console.log('🔍 [COMPLETE TASK] Verifying secret code...');
    const isValid = await nurseService.verifyStaffCode(secret_code);
    console.log('🔍 [COMPLETE TASK] Verification result:', isValid);
    
    if (!isValid) {
      console.log('❌ [COMPLETE TASK] Secret code verification FAILED');
      return res.status(401).json({ message: 'Invalid secret code' });
    }
    
    console.log('✅ [COMPLETE TASK] Secret code verified, proceeding with task completion');
    
    // Use the secret_code as the staff_code since we don't have it in auth
    const result = await nurseService.completeTask({
      task_id,
      staff_code: secret_code,  // <-- Use secret_code here!
      observation,
      medications_used,
      remarks,
      ecg_report
    });
    
    console.log('✅ [COMPLETE TASK] Task completed successfully:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ [COMPLETE TASK] Error:', err);
    next(err);
  }
};

export const getAvailableStock = async (req, res, next) => {
  try {
    const { stock_type } = req.query; // 'NURSE' or 'DRESSING'
    const stock = await nurseService.getAvailableStock(stock_type);
    res.json(stock);
  } catch (err) {
    next(err);
  }
};

export const verifySecretCode = async (req, res, next) => {
  try {
    const { secret_code } = req.body;
    const isValid = await nurseService.verifyStaffCode(secret_code);
    res.json({ valid: isValid });
  } catch (err) {
    next(err);
  }
};