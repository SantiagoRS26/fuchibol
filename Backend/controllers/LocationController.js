const LocationService = require('../services/LocationService');

class LocationController {
    static async createLocation(req, res) {
        try {
            const locationData = req.body;
            const createdLocation = await LocationService.createLocation(locationData);
            return res.status(201).json(createdLocation);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getAllLocations(req, res) {
        try {
            const locations = await LocationService.getAllLocations();
            return res.status(200).json(locations);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getLocationById(req, res) {
        try {
            const { id } = req.params;
            const location = await LocationService.getLocationById(id);
            if (!location) {
                return res.status(404).json({ message: 'Ubicación no encontrada' });
            }
            return res.status(200).json(location);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedLocation = await LocationService.updateLocation(id, updateData);
            if (!updatedLocation) {
                return res.status(404).json({ message: 'Ubicación no encontrada' });
            }
            return res.status(200).json(updatedLocation);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async deleteLocation(req, res) {
        try {
            const { id } = req.params;
            const deletedLocation = await LocationService.deleteLocation(id);
            if (!deletedLocation) {
                return res.status(404).json({ message: 'Ubicación no encontrada' });
            }
            return res.status(200).json({ message: 'Ubicación eliminada correctamente' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    /**
     * (Opcional) Obtiene ubicaciones cercanas (requiere ajustes en el modelo)
     */
    static async getNearbyLocations(req, res) {
        try {
            // Ejemplo de query param: /api/locations/nearby?lat=4.67&lng=-74.05&distance=2000
            const { lat, lng, distance } = req.query;
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);
            const distNum = parseInt(distance) || 5000;

            const locations = await LocationService.getLocationsNearby(latNum, lngNum, distNum);
            return res.status(200).json(locations);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = LocationController;