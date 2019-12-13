const mongoose = require('mongoose');

const ressortSchema = mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model('Ressort', ressortSchema);
