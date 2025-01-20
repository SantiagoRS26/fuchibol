const Location = require('../models/location');

class LocationService {
    static async createLocation(locationData) {
        try {
            const newLocation = new Location(locationData);
            return await newLocation.save();
        } catch (error) {
            throw new Error(`Error al crear la ubicación: ${error.message}`);
        }
    }

    static async getAllLocations() {
        try {
            return await Location.find(); // Recupera todas las ubicaciones desde MongoDB
        } catch (error) {
            throw new Error(`Error al obtener las ubicaciones: ${error.message}`);
        }
    }

    static async getLocationById(locationId) {
        try {
            return await Location.findById(locationId);
        } catch (error) {
            throw new Error(`Error al obtener la ubicación: ${error.message}`);
        }
    }

    static async updateLocation(locationId, updateData) {
        try {
            return await Location.findByIdAndUpdate(locationId, updateData, {
                new: true,
            });
        } catch (error) {
            throw new Error(`Error al actualizar la ubicación: ${error.message}`);
        }
    }

    static async deleteLocation(locationId) {
        try {
            return await Location.findByIdAndDelete(locationId);
        } catch (error) {
            throw new Error(`Error al eliminar la ubicación: ${error.message}`);
        }
    }

    static async incrementVote(locationId, voteType) {
        try {
            const updateField = voteType === 'good' ? { $inc: { goodVotes: 1 } } : { $inc: { badVotes: 1 } };
            return await Location.findByIdAndUpdate(locationId, updateField, { new: true });
        } catch (error) {
            throw new Error(`Error al incrementar el voto: ${error.message}`);
        }
    }
}

module.exports = LocationService;
