"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

interface Marker {
  position: [number, number];
  text: string;
  icon?: string;
  id: string; // Asegúrate de incluir el ID de la base de datos
}

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

const MapPage: React.FC = () => {
  const center: [number, number] = [4.146223, -73.607822];
  const zoom: number = 17;

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [votes, setVotes] = useState<Record<string, { good: number; bad: number }>>({});

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/locations`);
        const data = await response.json();

        const formattedMarkers = data.map((location: any) => ({
          position: [location.latitude, location.longitude] as [number, number],
          text: location.name,
          icon: location.icon || "/default-icon.png",
          id: location._id,
        }));

        setMarkers(formattedMarkers);

        // Inicializar votos
        const initialVotes = data.reduce((acc: any, location: any) => {
          acc[location._id] = { good: location.goodVotes, bad: location.badVotes };
          return acc;
        }, {});
        setVotes(initialVotes);
      } catch (error) {
        console.error("Error al cargar los marcadores:", error);
      }
    };

    fetchMarkers();
  }, []);

  const handleVote = async (id: string, type: "good" | "bad") => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/locations/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type }),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el voto");
      }

      const updatedLocation = await response.json();

      // Actualizar votos en el estado
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
          {markers.map((marker) => (
            <li key={marker.id} className="flex justify-between items-center mb-2">
              <span className="flex-1">{marker.text}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote(marker.id, "good")}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  Bueno ({votes[marker.id]?.good || 0})
                </button>
                <button
                  onClick={() => handleVote(marker.id, "bad")}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Malo ({votes[marker.id]?.bad || 0})
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapPage;
