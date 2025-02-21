const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ }, // Basic email validation
  city: { type: String, required: true },
  phone: { type: String, required: true },
  serviceSelected: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "" }, // Default as empty string
  leadType: { type: String, default: "" }, // Default as empty string
  followUp: { 
    type: [String], 
    default: [] // Array to store updates as strings
}, // Default as empty string
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
