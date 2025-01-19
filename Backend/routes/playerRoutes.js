const express = require('express');
const router = express.Router();
const PlayerController = require('../controllers/PlayerController');

router.post('/', PlayerController.createPlayer);

router.get('/', PlayerController.getAllPlayers);

router.get('/:id', PlayerController.getPlayerById);

router.put('/:id', PlayerController.updatePlayer);

router.delete('/:id', PlayerController.deletePlayer);

router.post('/:id/matchHistory', PlayerController.addMatchToHistory);

module.exports = router;