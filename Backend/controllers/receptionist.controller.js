import * as receptionistService from '../services/receptionist.service.js'
import ApiError from '../utils/ApiError.js'

export const registerPatient = async (req, res, next) => {
  try {
    await receptionistService.registerPatient(req.body)
    res.status(201).json({ message: 'Patient registered' })
  } catch (error) {
    next(error)
  }
}

export const createVisit = async (req, res, next) => {
  try {
    const result = await receptionistService.createVisit(req.body)
    res.status(201).json({
      message: 'Visit created',
      visit_id: result.visit_id
    })
  } catch (error) {
    next(error)
  }
}
export const getAvailableDoctors = async (req, res, next) => {
  try {
    const data = await receptionistService.getAllAvailableDoctors()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}



export const addVitals = async (req, res, next) => {
  try {
    await receptionistService.addVitals(req.body)
    res.status(201).json({ message: 'Vitals recorded' })
  } catch (error) {
    next(error)
  }
}

export const assignDoctor = async (req, res, next) => {
  try {
    const { visit_id } = req.params
    const { doctor_id } = req.body

    if (!doctor_id) throw new ApiError(400, 'doctor_id is required')

    await receptionistService.assignDoctorToVisit({ visit_id, doctor_id })

    res.status(200).json({ message: 'Doctor assigned successfully' })
  } catch (error) {
    next(error)
  }
}
export const updateDoctorAvailability = async (req, res, next) => {
  try {
    console.log("🔥 updateDoctorAvailability hit");
    console.log("🆔 doctor_id:", req.params.doctor_id);
    console.log("📥 body:", req.body);

    const { doctor_id } = req.params;
    const { availability_status } = req.body;

    if (!availability_status) {
      return res.status(400).json({success:false,message:"availability_status required"});
    }

    await receptionistService.updateDoctorAvailability(doctor_id, availability_status);

    res.json({
      success:true,
      message:"Doctor availability updated"
    });

  } catch (err) {
    console.error("💥 ERROR updateDoctorAvailability:", err);
    next(err);
  }
};

export const getPatients = async (req,res,next) => {
  try{
    const data = await receptionistService.getAllPatients()
    res.json({success:true,data})
  }catch(err) { next(err) }
}

export const getDoctors = async (req,res,next) => {
  try{
    const data = await receptionistService.getAllDoctors()
    res.json({success:true,data})
  }catch(err) { next(err) }
}

export const getVisits = async (req,res,next) => {
  try{
    const data = await receptionistService.getAllVisits()
    res.json({success:true,data})
  }catch(err) { next(err) }
}
export const startVisit = async (req,res,next)=>{
 try{
  await receptionistService.updateVisitStatus({
    visit_id:req.params.visit_id,
    newStatus:'IN_PROGRESS'
  })
  res.json({message:'Visit started'})
 }catch(e){next(e)}
}
export const cancelVisit = async (req,res,next)=>{
 try{
  await receptionistService.updateVisitStatus({
    visit_id:req.params.visit_id,
    newStatus:'CANCELLED'
  })
  res.json({message:'Visit cancelled'})
 }catch(e){next(e)}
}

