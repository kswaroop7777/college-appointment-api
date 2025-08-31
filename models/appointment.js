const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availability: { type: mongoose.Schema.Types.ObjectId, ref: 'Availability', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;