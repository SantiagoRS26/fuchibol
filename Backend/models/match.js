const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    assistBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    time: { type: Number, required: true }
});

const matchSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    teamA: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        role: { type: String, enum: ['Delantero', 'Defensa', 'Centrocampista', 'Portero', 'Lateral'] }
    }],
    teamB: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        role: { type: String, enum: ['Delantero', 'Defensa', 'Centrocampista', 'Portero', 'Lateral'] }
    }],
    goals: [goalSchema]
});

module.exports = mongoose.model('Match', matchSchema);