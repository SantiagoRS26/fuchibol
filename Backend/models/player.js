const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, enum: ['Delantero', 'Defensa', 'Centrocampista', 'Portero', 'Lateral'], required: true },
    totalGoals: { type: Number, default: 0 },
    totalAssists: { type: Number, default: 0 },
    matchHistory: [{
        matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
        role: { type: String },
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 }
    }]
});

module.exports = mongoose.model('Player', playerSchema);
