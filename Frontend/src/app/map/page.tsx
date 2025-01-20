"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Definir la interfaz Marker para tipar los marcadores
interface Marker {
  position: [number, number]; // Coordenadas [latitud, longitud]
  text: string; // Texto del popup
  icon?: string; // Ruta del ícono personalizado
}

// Cargar el componente Map dinámicamente
const Map = dynamic(() => import("../../components/Map"), { ssr: false });

const MapPage: React.FC = () => {
  const center: [number, number] = [4.146223, -73.607822]; // Coordenadas iniciales
  const zoom: number = 17;

  // Lista de marcadores con íconos personalizados
  const markers: Marker[] = [
    { position: center, text: "Cancha de Fulvo", icon: "/icono_cancha.png" },
    { position: [4.145431, -73.606288], text: "D1", icon: "/icono_d1.png" },
    { position: [4.146555, -73.610775], text: "Burguer POP", icon: "/icono_comida.png" },
    { position: [4.147002, -73.615614], text: "Arepas Malucas", icon: "/icono_comida.png" },
  ];

  const [votes, setVotes] = useState<Record<string, { good: number; bad: number }>>({});

  // Cargar votos del backend al montar el componente
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/locations/votes`);
        const data = await response.json();
        setVotes(data);
      } catch (error) {
        console.error("Error al cargar los votos:", error);
      }
    };

    fetchVotes();
  }, []);

  // Manejar el voto al hacer clic en "Bueno" o "Malo"
  const handleVote = async (id: string, type: "good" | "bad") => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/locations/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type }),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el voto");
      }

      const updatedLocation = await response.json();
      console.log("Voto registrado:", updatedLocation);

      // Actualizar el estado local con los nuevos votos
      setVotes((prevVotes) => ({
        ...prevVotes,
        [id]: {
          good: updatedLocation.goodVotes,
          bad: updatedLocation.badVotes,
        },
      }));
    } catch (error) {
      console.error("Error al registrar el voto:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mapa con Marcadores Personalizados</h1>
      <Map center={center} zoom={zoom} markers={markers} />
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Lista de Marcadores:</h2>
        <ul className="mt-2">
          {markers.map((marker, index) => {
            if (marker.position === center) return null; // Omitir el marcador central

            const id = `marker-${index}`;
            return (
              <li key={id} className="flex justify-between items-center mb-2">
                <span className="flex-1">{marker.text}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleVote(id, "good")} // Llama a la función handleVote
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Bueno ({votes[id]?.good || 0})
                  </button>
                  <button
                    onClick={() => handleVote(id, "bad")} // Llama a la función handleVote
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Malo ({votes[id]?.bad || 0})
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MapPage;
