"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Player = {
	_id: string;
	name: string;
};

interface AddGoalFormProps {
	matchId: string;
}

export default function AddGoalForm({ matchId }: AddGoalFormProps) {
	const router = useRouter();

	const [players, setPlayers] = useState<Player[]>([]);
	const [playerId, setPlayerId] = useState("");
	const [assistBy, setAssistBy] = useState("");
	const [time, setTime] = useState("");

	// Duración del partido (en minutos)
	const matchDuration = 60;

	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`
				);
				if (!res.ok) {
					console.error("Error al obtener jugadores");
					return;
				}
				const data = await res.json();
				setPlayers(data);
			} catch (error) {
				console.error(error);
			}
		};
		fetchPlayers();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!playerId || !time) {
			alert("Debes seleccionar jugador y un minuto válido.");
			return;
		}

		const enteredMinute = Number(time);
		if (enteredMinute < 1 || enteredMinute > matchDuration) {
			alert(`El minuto debe estar entre 1 y ${matchDuration}.`);
			return;
		}

		const actualMinute = matchDuration - enteredMinute;

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}/goals`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						player: playerId,
						assistBy: assistBy || null,
						time: actualMinute,
					}),
				}
			);

			if (!res.ok) {
				console.error("Error al agregar gol");
				return;
			}

			router.refresh();
			setPlayerId("");
			setAssistBy("");
			setTime("");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Agregar Gol</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-4">
					<div>
						<Label htmlFor="playerId">Jugador que anota:</Label>
						<select
							id="playerId"
							value={playerId}
							onChange={(e) => setPlayerId(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300">
							<option value="">Selecciona jugador</option>
							{players.map((p) => (
								<option
									key={p._id}
									value={p._id}>
									{p.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<Label htmlFor="assistBy">Jugador que asiste (opcional):</Label>
						<select
							id="assistBy"
							value={assistBy}
							onChange={(e) => setAssistBy(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300">
							<option value="">Sin asistencia</option>
							{players.map((p) => (
								<option
									key={p._id}
									value={p._id}>
									{p.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<Label htmlFor="time">Minuto de gol:</Label>
						<Input
							id="time"
							type="number"
							min="1"
							placeholder="Ej: 45"
							value={time}
							onChange={(e) => setTime(e.target.value)}
						/>
					</div>

					<Button type="submit">Registrar Gol</Button>
				</form>
			</CardContent>
		</Card>
	);
}
