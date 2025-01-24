const Match = require('../models/match');
const Player = require('../models/player');

class MatchService {

  static async createMatch(matchData) {
    try {
      const newMatch = new Match(matchData);
      const savedMatch = await newMatch.save();

      // 1. Recorre todos los jugadores de teamA
      for (const item of savedMatch.teamA) {
        const playerId = item.player; // ObjectId
        const role = item.role;
        const player = await Player.findById(playerId);
        if (!player) continue;

        // Verifica si ya existe un registro de este partido en matchHistory
        const existing = player.matchHistory.find(
          (mh) => mh.matchId.toString() === savedMatch._id.toString()
        );

        if (!existing) {
          player.matchHistory.push({
            matchId: savedMatch._id,
            role,         // Asignamos el rol
            goals: 0,     // Por defecto 0
            assists: 0,   // Por defecto 0
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
      // 1. Obtener el partido existente (antes de actualizar)
      const existingMatch = await Match.findById(matchId);
      if (!existingMatch) {
        return null; // Manejo de error en controlador
      }

      // Estructura actual en la BD
      const oldTeamA = existingMatch.teamA || []; // [{ player, role }, ...]
      const oldTeamB = existingMatch.teamB || [];

      // Datos nuevos (desde el body)
      const newTeamA = updateData.teamA || [];
      const newTeamB = updateData.teamB || [];

      // 2. Actualizar campos básicos del partido
      if (updateData.date !== undefined) existingMatch.date = updateData.date;
      // Actualizar el array de goles si se pasa (opcional)
      if (updateData.goals !== undefined) existingMatch.goals = updateData.goals;

      // Ahora actualizamos teamA y teamB
      existingMatch.teamA = newTeamA;
      existingMatch.teamB = newTeamB;

      // 3. Guardar cambios en la BD (partido)
      const updatedMatch = await existingMatch.save();

      // 4. Manejar las diferencias en los equipos para actualizar 'matchHistory' de los jugadores
      //    a) Jugadores añadidos => agregar registro
      //    b) Jugadores quitados => eliminar registro (o dejarlo, según tu modelo)
      //    c) Jugadores que cambian de rol => actualizar 'role' en su matchHistory

      // Primero, convertiremos oldTeamA/oldTeamB y newTeamA/newTeamB en
      //   Map<ObjectId, role> para cada equipo
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

      // Jugadores *antes* (old) en cualquier equipo
      const oldPlayersSet = new Set([...oldTeamAmap.keys(), ...oldTeamBmap.keys()]);
      // Jugadores *después* (new) en cualquier equipo
      const newPlayersSet = new Set([...newTeamAmap.keys(), ...newTeamBmap.keys()]);

      // 4a. Jugadores removidos (estaban en old y ya no están en new)
      const removedPlayers = [...oldPlayersSet].filter((pid) => !newPlayersSet.has(pid));

      // 4b. Jugadores añadidos (no estaban en old y ahora sí están en new)
      const addedPlayers = [...newPlayersSet].filter((pid) => !oldPlayersSet.has(pid));

      // 4c. Jugadores que permanecen, pero tal vez cambiaron de equipo o de rol
      const samePlayers = [...oldPlayersSet].filter((pid) => newPlayersSet.has(pid));

      // =========== A) Manejar jugadores añadidos =============
      for (const pid of addedPlayers) {
        const player = await Player.findById(pid);
        if (!player) continue;

        // Determinar si está en teamA o teamB (nuevo)
        let role = null;
        if (newTeamAmap.has(pid)) {
          role = newTeamAmap.get(pid);
        } else {
          role = newTeamBmap.get(pid);
        }

        // Crear registro en matchHistory
        // Ver si ya existía por alguna razón (evitar duplicar)
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
          // si existía y quieres actualizarlo, hazlo
          existingHistory.role = role;
        }

        await player.save();
      }

      // =========== B) Manejar jugadores removidos =============
      // (Opcional: si deseas borrarlos de su matchHistory)
      for (const pid of removedPlayers) {
        const player = await Player.findById(pid);
        if (!player) continue;

        // Borrar el matchId de su matchHistory si quieres
        const index = player.matchHistory.findIndex(
          (mh) => mh.matchId.toString() === matchId
        );
        if (index !== -1) {
          // OJO: Si quieres conservar el histórico de un partido
          // que el jugador haya "jugado" en el pasado, no lo elimines.
          // Pero si tu lógica es removerlo completamente:
          player.matchHistory.splice(index, 1);
        }

        await player.save();
      }

      // =========== C) Manejar jugadores que permanecen (cambio de rol) =============
      // Este es el caso en que el jugador sigue en el partido, pero
      // pudo cambiar de equipo o de rol. Actualizamos la propiedad 'role'.
      for (const pid of samePlayers) {
        const oldRoleA = oldTeamAmap.get(pid); // undefined si no estaba
        const oldRoleB = oldTeamBmap.get(pid);
        const newRoleA = newTeamAmap.get(pid);
        const newRoleB = newTeamBmap.get(pid);

        let oldRole = oldRoleA || oldRoleB; // Rol previo
        let newRole = newRoleA || newRoleB; // Rol nuevo

        // Si no cambió, no hacemos nada:
        if (oldRole === newRole) {
          continue;
        }

        // Pero si cambió, actualizamos en matchHistory
        const player = await Player.findById(pid);
        if (!player) continue;

        const existingHistory = player.matchHistory.find(
          (mh) => mh.matchId.toString() === matchId
        );
        if (existingHistory) {
          existingHistory.role = newRole;
          // goals y assists se mantienen si ya hubo registros
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
      return await Match.findByIdAndDelete(matchId);
    } catch (error) {
      throw new Error(`Error al eliminar el partido: ${error.message}`);
    }
  }

  static async addGoal(matchId, goalData) {
    try {
      const match = await Match.findById(matchId);
      if (!match) {
        throw new Error('Partido no encontrado');
      }

      match.goals.push(goalData);

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