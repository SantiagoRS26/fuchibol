const express = require('express');
const router = express.Router();
const MatchController = require('../controllers/MatchController');

router.post('/', MatchController.createMatch);

router.get('/', MatchController.getAllMatches);

router.get('/:id', MatchController.getMatchById);

router.put('/:id', MatchController.updateMatch);

router.delete('/:id', MatchController.deleteMatch);

router.post('/:id/goals', MatchController.addGoal);

router.patch('/:id/players/:playerId/position', MatchController.updatePlayerPositionInMatch);

module.exports = router;