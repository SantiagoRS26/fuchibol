import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Interfaz para definir el tipo de marcadores
interface Marker {
  position: [number, number]; // Coordenadas [latitud, longitud]
  text: string; // Texto del popup
  icon?: string; // Ruta al ícono personalizado
}

interface MapProps {
  center?: [number, number]; // Coordenadas iniciales [latitud, longitud]
  zoom?: number; // Nivel de zoom
  markers?: Marker[]; // Lista de marcadores
}

const Map: React.FC<MapProps> = ({
  center = [4.6097, -74.0817],
  zoom = 13,
  markers = [], // Marcadores predeterminados vacío
}) => {
  useEffect(() => {
    // Inicializar el mapa
    const map = L.map("map").setView(center, zoom);

    // Añadir la capa base de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Añadir los marcadores al mapa
    markers.forEach((marker) => {
      // Configurar un ícono personalizado para cada marcador
      const customIcon = L.icon({
        iconUrl: marker.icon || "/default-icon.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Crear el marcador con el ícono personalizado
      L.marker(marker.position, { icon: customIcon })
        .addTo(map)
        .bindPopup(marker.text); // Texto del popup
    });

    // Limpiar el mapa cuando el componente se desmonte
    return () => {
      map.remove();
    };
  }, [center, zoom, markers]);

  return <div id="map" style={{ height: "500px", width: "100%" }}></div>;
};

export default Map;
