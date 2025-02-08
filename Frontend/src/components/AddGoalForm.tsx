// En AddGoalForm
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
	const [playerName, setPlayerName] = useState("");
	const [assistByName, setAssistByName] = useState("");
	const [time, setTime] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

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
					setErrorMsg(
						"Error al obtener jugadores. Intenta recargar la página."
					);
					return;
				}
				const data = await res.json();
				setPlayers(data);
			} catch (error) {
				console.error(error);
				setErrorMsg("Error en la conexión. Intenta más tarde.");
			}
		};
		fetchPlayers();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg("");

		if (!playerName || !time) {
			setErrorMsg("Debes seleccionar un jugador y un minuto válido.");
			return;
		}

		const enteredMinute = Number(time);
		if (enteredMinute < 1 || enteredMinute > matchDuration) {
			setErrorMsg(`El minuto debe estar entre 1 y ${matchDuration}.`);
			return;
		}

		// Encuentra el jugador por nombre (asumiendo nombres únicos)
		const selectedPlayer = players.find((p) => p.name === playerName);
		const selectedAssist = players.find((p) => p.name === assistByName);

		if (!selectedPlayer) {
			setErrorMsg("El jugador que anota no fue encontrado.");
			return;
		}

		const actualMinute = matchDuration - enteredMinute;

		setIsSubmitting(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}/goals`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						player: selectedPlayer._id,
						assistBy: selectedAssist ? selectedAssist._id : null,
						time: actualMinute,
					}),
				}
			);

			if (!res.ok) {
				setErrorMsg("Error al agregar gol. Por favor, intenta nuevamente.");
				setIsSubmitting(false);
				return;
			}

			router.refresh();
			setPlayerName("");
			setAssistByName("");
			setTime("");
		} catch (error) {
			console.error(error);
			setErrorMsg("Error en la conexión. Intenta más tarde.");
		}
		setIsSubmitting(false);
	};

	return (
		<Card className="max-w-md mx-auto">
			<CardHeader className="bg-green-500 text-white px-4 py-3 rounded-t-md">
				<CardTitle className="text-lg font-bold">Registrar Nuevo Gol</CardTitle>
			</CardHeader>
			<CardContent className="px-4 py-6">
				{errorMsg && (
					<div className="mb-4 text-red-600 text-sm">{errorMsg}</div>
				)}
				<form
					onSubmit={handleSubmit}
					className="space-y-5">
					<div>
						<Label
							htmlFor="playerName"
							className="block text-sm font-medium text-gray-700">
							Jugador que anota:
						</Label>
						<Input
							id="playerName"
							list="players-list"
							placeholder="Escribe el nombre..."
							value={playerName}
							onChange={(e) => setPlayerName(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
						/>
						<datalist id="players-list">
							{players.map((p) => (
								<option
									key={p._id}
									value={p.name}
								/>
							))}
						</datalist>
					</div>

					<div>
						<Label
							htmlFor="assistByName"
							className="block text-sm font-medium text-gray-700">
							Jugador que asiste (opcional):
						</Label>
						<Input
							id="assistByName"
							list="players-list-assist"
							placeholder="Escribe el nombre..."
							value={assistByName}
							onChange={(e) => setAssistByName(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
						/>
						<datalist id="players-list-assist">
							{players.map((p) => (
								<option
									key={p._id}
									value={p.name}
								/>
							))}
						</datalist>
					</div>

					<div>
						<Label
							htmlFor="time"
							className="block text-sm font-medium text-gray-700">
							Minuto de gol:
						</Label>
						<Input
							id="time"
							type="number"
							min="1"
							max={matchDuration.toString()}
							placeholder={`Ej: 45 (1 - ${matchDuration})`}
							value={time}
							onChange={(e) => setTime(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
						/>
						<p className="mt-1 text-xs text-gray-500">
							Recuerda: el minuto ingresado se invierte para calcular el tiempo
							real.
						</p>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full">
						{isSubmitting ? "Registrando..." : "Registrar Gol"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
