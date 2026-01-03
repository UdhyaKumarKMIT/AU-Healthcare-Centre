// src/controllers/labtech.controller.js
import * as labTechService from '../services/labtech.service.js';

export const getLabTechStats = async (req, res, next) => {
  try {
    const { timeRange } = req.query;
    const stats = await labTechService.getLabTechStats(timeRange);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const getAllLabTests = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const tests = await labTechService.getAllLabTests({ status, priority, search });
    res.json({ success: true, data: tests, count: tests.length });
  } catch (err) {
    next(err);
  }
};

export const getLabTestById = async (req, res, next) => {
  try {
    const { test_id } = req.params;
    const test = await labTechService.getLabTestById(test_id);
    res.json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

export const submitTestResults = async (req, res, next) => {
  try {
    const { test_id } = req.params;
    const { result, normal_range } = req.body;
    
    if (!result) {
      return res.status(400).json({ 
        success: false, 
        message: 'Test result is required' 
      });
    }
    
    const test = await labTechService.submitTestResults(test_id, { result, normal_range });
    res.json({ 
      success: true, 
      message: 'Test results submitted successfully',
      data: test 
    });
  } catch (err) {
    next(err);
  }
};

export const getAllLabTechnicians = async (req, res, next) => {
  try {
    const technicians = await labTechService.getAllLabTechnicians();
    res.json({ success: true, data: technicians, count: technicians.length });
  } catch (err) {
    next(err);
  }
};