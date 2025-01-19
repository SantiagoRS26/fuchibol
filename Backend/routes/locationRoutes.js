const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');

router.post('/', LocationController.createLocation);

router.get('/', LocationController.getAllLocations);

router.get('/:id', LocationController.getLocationById);

router.put('/:id', LocationController.updateLocation);

router.delete('/:id', LocationController.deleteLocation);

router.get('/nearby/search', LocationController.getNearbyLocations);

module.exports = router;