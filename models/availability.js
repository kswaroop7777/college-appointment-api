const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;