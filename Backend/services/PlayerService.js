const Player = require('../models/player');

class PlayerService {

    static async createPlayer(playerData) {
        try {
            const newPlayer = new Player(playerData);
            return await newPlayer.save();
        } catch (error) {
            throw new Error(`Error al crear el jugador: ${error.message}`);
        }
    }

    static async getAllPlayers() {
        try {
            return await Player.find();
        } catch (error) {
            throw new Error(`Error al obtener jugadores: ${error.message}`);
        }
    }

    static async getPlayerById(playerId) {
        try {
            return await Player.findById(playerId);
        } catch (error) {
            throw new Error(`Error al obtener el jugador: ${error.message}`);
        }
    }

    static async updatePlayer(playerId, updateData) {
        try {
            return await Player.findByIdAndUpdate(playerId, updateData, {
                new: true,
            });
        } catch (error) {
            throw new Error(`Error al actualizar el jugador: ${error.message}`);
        }
    }

    static async deletePlayer(playerId) {
        try {
            return await Player.findByIdAndDelete(playerId);
        } catch (error) {
            throw new Error(`Error al eliminar el jugador: ${error.message}`);
        }
    }

    static async addMatchToHistory(playerId, matchHistoryData) {
        try {
            const player = await Player.findById(playerId);
            if (!player) {
                throw new Error('Jugador no encontrado');
            }

            player.matchHistory.push(matchHistoryData);

            player.totalGoals += matchHistoryData.goals || 0;
            player.totalAssists += matchHistoryData.assists || 0;

            return await player.save();
        } catch (error) {
            throw new Error(`Error al agregar historial de partido: ${error.message}`);
        }
    }
}

module.exports = PlayerService;