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
            return await Location.find();
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

    /**
     * (Opcional) Obtiene ubicaciones cercanas a una latitud/longitud dada.
     * Para usar esto, necesitarías un índice geoespacial (2dsphere) y
     * almacenar la ubicación como GeoJSON en el schema. 
     * Aquí se muestra sólo la firma del método a modo ilustrativo.
     */
    static async getLocationsNearby(lat, lng, maxDistance = 5000) {
        try {
            // EJEMPLO: Deberías ajustar tu esquema a un campo "location: { type: Point, coordinates: [lng, lat] }" 
            // y crear un índice geoespacial. Una vez hecho, podrías usar algo como:
            /*
            return await Location.find({
              location: {
                $near: {
                  $geometry: { type: 'Point', coordinates: [ lng, lat ] },
                  $maxDistance: maxDistance
                }
              }
            });
            */
            // De momento, retornamos vacío o un simple find() (ejemplo básico):
            return await Location.find();
        } catch (error) {
            throw new Error(`Error al obtener ubicaciones cercanas: ${error.message}`);
        }
    }
}

module.exports = LocationService;