const express = require('express');
const Availability = require('../models/availability');
const Appointment = require('../models/appointment');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/professors/:id/availability
// @desc    Professor specifies availability
router.post('/:id/availability', authMiddleware(['professor']), async (req, res) => {
  const { date, startTime, endTime } = req.body;
  try {
    const newAvailability = new Availability({
      professor: req.params.id,
      date,
      startTime,
      endTime,
    });
    await newAvailability.save();
    res.status(201).json(newAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/professors/appointments/:id/cancel
// @desc    Professor cancels an appointment
router.delete('/appointments/:id/cancel', authMiddleware(['professor']), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Mark appointment as cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    // Make the corresponding availability slot free again
    await Availability.findByIdAndUpdate(appointment.availability, { isBooked: false });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
