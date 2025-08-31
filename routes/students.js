const express = require('express');
const Availability = require('../models/availability');
const Appointment = require('../models/appointment');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/students/appointments
// @desc    Get student's appointments
router.get('/appointments', authMiddleware(['student']), async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user._id }).populate('professor').populate('availability');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/professors/:id/availability
// @desc    View a professor's available slots
router.get('/professors/:id/availability', authMiddleware(['student']), async (req, res) => {
  try {
    const availability = await Availability.find({
      professor: req.params.id,
      isBooked: false,
    });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/students/appointments
// @desc    Book an appointment with a professor
router.post('/appointments', authMiddleware(['student']), async (req, res) => {
  const { professorId, availabilityId } = req.body;
  try {
    const availability = await Availability.findById(availabilityId);
    if (!availability || availability.isBooked) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    const newAppointment = new Appointment({
      professor: professorId,
      student: req.user._id,
      availability: availabilityId,
    });
    await newAppointment.save();

    // Mark the availability slot as booked
    await Availability.findByIdAndUpdate(availabilityId, { isBooked: true });

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;