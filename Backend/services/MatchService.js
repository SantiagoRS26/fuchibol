const Match = require('../models/match');
const Player = require('../models/player');

class MatchService {

  static async createMatch(matchData) {
    try {
      const newMatch = new Match(matchData);
      const savedMatch = await newMatch.save();

      for (const item of savedMatch.teamA) {
        const playerId = item.player;
        const role = item.role;
        const player = await Player.findById(playerId);
        if (!player) continue;

        const existing = player.matchHistory.find(
          (mh) => mh.matchId.toString() === savedMatch._id.toString()
        );

        if (!existing) {
          player.matchHistory.push({
            matchId: savedMatch._id,
            role,
            goals: 0,
            assists: 0,
          });
          await player.save();
        }
      }

      for (const item of savedMatch.teamB) {
        const playerId = item.player;
        const role = item.role;
        const player = await Player.findById(playerId);
        if (!player) continue;

        const existing = player.matchHistory.find(
          (mh) => mh.matchId.toString() === savedMatch._id.toString()
        );

        if (!existing) {
          player.matchHistory.push({
            matchId: savedMatch._id,
            role,
            goals: 0,
            assists: 0,
          });
          await player.save();
        }
      }

      return savedMatch;
    } catch (error) {
      throw new Error(`Error al crear el partido: ${error.message}`);
    }
  }

  static async getAllMatches() {
    try {
      return await Match.find()
        .populate('teamA.player', 'name position')
        .populate('teamB.player', 'name position')
        .populate('goals.player', 'name position')
        .populate('goals.assistBy', 'name position');
    } catch (error) {
      throw new Error(`Error al obtener los partidos: ${error.message}`);
    }
  }

  static async getMatchById(matchId) {
    try {
      return await Match.findById(matchId)
        .populate('teamA.player', 'name position profilePhoto')
        .populate('teamB.player', 'name position profilePhoto')
        .populate('goals.player', 'name position profilePhoto')
        .populate('goals.assistBy', 'name position profilePhoto');
    } catch (error) {
      throw new Error(`Error al obtener el partido: ${error.message}`);
    }
  }

  static async updateMatch(matchId, updateData) {
    try {
      const existingMatch = await Match.findById(matchId);
      if (!existingMatch) {
        return null;
      }

      const oldTeamA = existingMatch.teamA || [];
      const oldTeamB = existingMatch.teamB || [];

      const newTeamA = updateData.teamA || [];
      const newTeamB = updateData.teamB || [];

      if (updateData.date !== undefined) existingMatch.date = updateData.date;
      if (updateData.goals !== undefined) existingMatch.goals = updateData.goals;

      existingMatch.teamA = newTeamA;
      existingMatch.teamB = newTeamB;

      const updatedMatch = await existingMatch.save();

      const oldTeamAmap = new Map();
      oldTeamA.forEach(item => {
        oldTeamAmap.set(item.player.toString(), item.role);
      });
      const oldTeamBmap = new Map();
      oldTeamB.forEach(item => {
        oldTeamBmap.set(item.player.toString(), item.role);
      });

      const newTeamAmap = new Map();
      newTeamA.forEach(item => {
        newTeamAmap.set(item.player.toString(), item.role);
      });
      const newTeamBmap = new Map();
      newTeamB.forEach(item => {
        newTeamBmap.set(item.player.toString(), item.role);
      });

      const oldPlayersSet = new Set([...oldTeamAmap.keys(), ...oldTeamBmap.keys()]);
      const newPlayersSet = new Set([...newTeamAmap.keys(), ...newTeamBmap.keys()]);

      const removedPlayers = [...oldPlayersSet].filter((pid) => !newPlayersSet.has(pid));

      const addedPlayers = [...newPlayersSet].filter((pid) => !oldPlayersSet.has(pid));

      const samePlayers = [...oldPlayersSet].filter((pid) => newPlayersSet.has(pid));

      for (const pid of addedPlayers) {
        const player = await Player.findById(pid);
        if (!player) continue;

        let role = null;
        if (newTeamAmap.has(pid)) {
          role = newTeamAmap.get(pid);
        } else {
          role = newTeamBmap.get(pid);
        }

        const existingHistory = player.matchHistory.find(
          (mh) => mh.matchId.toString() === matchId
        );
        if (!existingHistory) {
          player.matchHistory.push({
            matchId,
            role,
            goals: 0,
            assists: 0,
          });
        } else {
          existingHistory.role = role;
        }

        await player.save();
      }

      for (const pid of removedPlayers) {
        const player = await Player.findById(pid);
        if (!player) continue;

        const index = player.matchHistory.findIndex(
          (mh) => mh.matchId.toString() === matchId
        );
        if (index !== -1) {
          player.matchHistory.splice(index, 1);
        }

        await player.save();
      }

      for (const pid of samePlayers) {
        const oldRoleA = oldTeamAmap.get(pid);
        const oldRoleB = oldTeamBmap.get(pid);
        const newRoleA = newTeamAmap.get(pid);
        const newRoleB = newTeamBmap.get(pid);

        let oldRole = oldRoleA || oldRoleB;
        let newRole = newRoleA || newRoleB;

        if (oldRole === newRole) {
          continue;
        }

        const player = await Player.findById(pid);
        if (!player) continue;

        const existingHistory = player.matchHistory.find(
          (mh) => mh.matchId.toString() === matchId
        );
        if (existingHistory) {
          existingHistory.role = newRole;
        }

        await player.save();
      }

      return updatedMatch;
    } catch (error) {
      throw new Error(`Error al actualizar el partido: ${error.message}`);
    }
  }

  static async deleteMatch(matchId) {
    try {
      const match = await Match.findById(matchId);
      if (!match) {
        throw new Error('Partido no encontrado');
      }
      const playerIds = new Set();

      match.teamA.forEach((item) => playerIds.add(item.player.toString()));
      match.teamB.forEach((item) => playerIds.add(item.player.toString()));
      match.goals.forEach((goal) => {
        playerIds.add(goal.player.toString());
        if (goal.assistBy) {
          playerIds.add(goal.assistBy.toString());
        }
      });

      for (const pid of playerIds) {
        const player = await Player.findById(pid);
        if (player) {
          const index = player.matchHistory.findIndex(
            (mh) => mh.matchId.toString() === matchId
          );

          if (index !== -1) {
            const removedGoals = player.matchHistory[index].goals || 0;
            const removedAssists = player.matchHistory[index].assists || 0;

            player.totalGoals = Math.max(0, player.totalGoals - removedGoals);
            player.totalAssists = Math.max(0, player.totalAssists - removedAssists);

            player.matchHistory.splice(index, 1);

            await player.save();
          }
        }
      }

      await Match.findByIdAndDelete(matchId);

      return { message: 'Partido eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar el partido: ${error.message}`);
    }
  }

  static async startMatch(matchId) {
    try {
      const match = await Match.findById(matchId);
      if (!match) {
        throw new Error("Partido no encontrado");
      }
      if (match.status !== 'pending') {
        throw new Error("El partido ya ha comenzado o finalizado");
      }
      match.startTime = new Date();
      match.status = 'active';
      return await match.save();
    } catch (error) {
      throw new Error(`Error al iniciar el partido: ${error.message}`);
    }
  }

  static async stopMatch(matchId) {
    try {
      const match = await Match.findById(matchId);
      if (!match) {
        throw new Error("Partido no encontrado");
      }
      if (match.status !== 'active') {
        throw new Error("El partido no se encuentra activo");
      }
      match.endTime = new Date();
      match.status = 'finished';
      return await match.save();
    } catch (error) {
      throw new Error(`Error al detener el partido: ${error.message}`);
    }
  }


  static async addGoal(matchId, goalData) {
    try {
      const match = await Match.findById(matchId);
      if (!match) {
        throw new Error('Partido no encontrado');
      }

      let goalTime = 0;
      if (match.status === 'active' && match.startTime) {
        const elapsedMs = new Date() - new Date(match.startTime);
        goalTime = Math.floor(elapsedMs / 60000);
      } else {
        goalTime = goalData.time || 0;
      }

      const newGoal = {
        player: goalData.player,
        assistBy: goalData.assistBy,
        time: goalTime,
      };

      match.goals.push(newGoal);
      const updatedMatch = await match.save();

      const scoringPlayer = await Player.findById(goalData.player);
      if (scoringPlayer) {
        scoringPlayer.totalGoals += 1;
        const matchHistoryItem = scoringPlayer.matchHistory.find(
          (mh) => mh.matchId.toString() === matchId
        );
        if (matchHistoryItem) {
          matchHistoryItem.goals += 1;
        } else {
          scoringPlayer.matchHistory.push({
            matchId,
            goals: 1,
            assists: 0,
          });
        }
        await scoringPlayer.save();
      }

      if (goalData.assistBy) {
        const assistPlayer = await Player.findById(goalData.assistBy);
        if (assistPlayer) {
          assistPlayer.totalAssists += 1;
          const matchHistoryItem = assistPlayer.matchHistory.find(
            (mh) => mh.matchId.toString() === matchId
          );
          if (matchHistoryItem) {
            matchHistoryItem.assists += 1;
          } else {
            assistPlayer.matchHistory.push({
              matchId,
              goals: 0,
              assists: 1,
            });
          }
          await assistPlayer.save();
        }
      }

      return updatedMatch;
    } catch (error) {
      throw new Error(`Error al agregar el gol: ${error.message}`);
    }
  }

  static async updatePlayerPositionInMatch(matchId, playerId, positionData) {
    try {
      const match = await Match.findById(matchId);
      if (!match) {
        return null;
      }

      let playerItem = match.teamA.find((item) => item.player.toString() === playerId);

      if (!playerItem) {
        playerItem = match.teamB.find((item) => item.player.toString() === playerId);
      }

      if (!playerItem) {
        return null;
      }

      playerItem.position = {
        x: positionData.x !== undefined ? positionData.x : playerItem.position?.x,
        y: positionData.y !== undefined ? positionData.y : playerItem.position?.y
      };

      await match.save();
      return match;

    } catch (error) {
      throw new Error(`Error al actualizar la posición del jugador en el partido: ${error.message}`);
    }
  }
}

module.exports = MatchService;