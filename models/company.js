// models/company.js

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
