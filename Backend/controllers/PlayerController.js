const PlayerService = require('../services/PlayerService');

class PlayerController {
    static async createPlayer(req, res) {
        try {
            const playerData = req.body;
            const createdPlayer = await PlayerService.createPlayer(playerData);
            return res.status(201).json(createdPlayer);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getAllPlayers(req, res) {
        try {
            const players = await PlayerService.getAllPlayers();
            return res.status(200).json(players);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getPlayerById(req, res) {
        try {
            const { id } = req.params;
            const player = await PlayerService.getPlayerById(id);
            if (!player) {
                return res.status(404).json({ message: 'Jugador no encontrado' });
            }
            return res.status(200).json(player);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updatePlayer(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedPlayer = await PlayerService.updatePlayer(id, updateData);
            if (!updatedPlayer) {
                return res.status(404).json({ message: 'Jugador no encontrado' });
            }
            return res.status(200).json(updatedPlayer);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async deletePlayer(req, res) {
        try {
            const { id } = req.params;
            const deletedPlayer = await PlayerService.deletePlayer(id);
            if (!deletedPlayer) {
                return res.status(404).json({ message: 'Jugador no encontrado' });
            }
            return res.status(200).json({ message: 'Jugador eliminado correctamente' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async addMatchToHistory(req, res) {
        try {
            const { id } = req.params;
            const matchHistoryData = req.body;

            const updatedPlayer = await PlayerService.addMatchToHistory(id, matchHistoryData);
            if (!updatedPlayer) {
                return res.status(404).json({ message: 'Jugador no encontrado' });
            }
            return res.status(200).json(updatedPlayer);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async syncStats(req, res) {
        try {
            const updatedPlayers = await PlayerService.syncStats();
            return res.status(200).json({
                message: 'Estadísticas sincronizadas correctamente.',
                players: updatedPlayers
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = PlayerController;