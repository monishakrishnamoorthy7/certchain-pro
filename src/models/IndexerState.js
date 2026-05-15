const mongoose = require('mongoose');

const IndexerStateSchema = new mongoose.Schema({
  network: { type: String, required: true, unique: true },
  lastProcessedBlock: { type: Number, default: 0 }
});

module.exports = mongoose.model('IndexerState', IndexerStateSchema);
