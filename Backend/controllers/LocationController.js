const LocationService = require('../services/LocationService');

class LocationController {
    static async createLocation(req, res) {
        try {
            const newLocation = await LocationService.createLocation(req.body);
            res.status(201).json(newLocation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllLocations(req, res) {
        try {
            const locations = await LocationService.getAllLocations();
            res.status(200).json(locations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getLocationById(req, res) {
        try {
            const location = await LocationService.getLocationById(req.params.id);
            if (!location) {
                return res.status(404).json({ error: 'Ubicación no encontrada' });
            }
            res.status(200).json(location);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateLocation(req, res) {
        try {
            const updatedLocation = await LocationService.updateLocation(req.params.id, req.body);
            res.status(200).json(updatedLocation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteLocation(req, res) {
        try {
            await LocationService.deleteLocation(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async voteLocation(req, res) {
        try {
            const { id } = req.params;
            const { voteType } = req.body;

            if (!['good', 'bad'].includes(voteType)) {
                return res.status(400).json({ error: 'Tipo de voto inválido' });
            }

            const updatedLocation = await LocationService.incrementVote(id, voteType);
            res.status(200).json(updatedLocation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = LocationController;
