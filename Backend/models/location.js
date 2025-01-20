const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    category: { type: String, required: false },
    icon: { type: String, required: false },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
});

module.exports = mongoose.model('Location', locationSchema);
