const MatchService = require('../services/MatchService');

class MatchController {
    static async createMatch(req, res) {
        try {
            const matchData = req.body;
            const createdMatch = await MatchService.createMatch(matchData);
            return res.status(201).json(createdMatch);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getAllMatches(req, res) {
        try {
            const matches = await MatchService.getAllMatches();
            return res.status(200).json(matches);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getMatchById(req, res) {
        try {
            const { id } = req.params;
            const match = await MatchService.getMatchById(id);
            if (!match) {
                return res.status(404).json({ message: 'Partido no encontrado' });
            }
            return res.status(200).json(match);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateMatch(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedMatch = await MatchService.updateMatch(id, updateData);
            if (!updatedMatch) {
                return res.status(404).json({ message: 'Partido no encontrado' });
            }
            return res.status(200).json(updatedMatch);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async deleteMatch(req, res) {
        try {
            const { id } = req.params;
            const deletedMatch = await MatchService.deleteMatch(id);
            if (!deletedMatch) {
                return res.status(404).json({ message: 'Partido no encontrado' });
            }
            return res.status(200).json({ message: 'Partido eliminado correctamente' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async addGoal(req, res) {
        try {
            const { id } = req.params;
            const goalData = req.body;
            const updatedMatch = await MatchService.addGoal(id, goalData);
            return res.status(200).json(updatedMatch);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = MatchController;