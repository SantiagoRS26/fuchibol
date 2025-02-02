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

		if (!playerId || !time) {
			setErrorMsg("Debes seleccionar un jugador y un minuto válido.");
			return;
		}

		const enteredMinute = Number(time);
		if (enteredMinute < 1 || enteredMinute > matchDuration) {
			setErrorMsg(`El minuto debe estar entre 1 y ${matchDuration}.`);
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
						player: playerId,
						assistBy: assistBy || null,
						time: actualMinute,
					}),
				}
			);

			if (!res.ok) {
				setErrorMsg("Error al agregar gol. Por favor, intenta nuevamente.");
				setIsSubmitting(false);
				return;
			}

			// Actualiza la vista y reinicia el formulario
			router.refresh();
			setPlayerId("");
			setAssistBy("");
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
							htmlFor="playerId"
							className="block text-sm font-medium text-gray-700">
							Jugador que anota:
						</Label>
						<select
							id="playerId"
							value={playerId}
							onChange={(e) => setPlayerId(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
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
						<Label
							htmlFor="assistBy"
							className="block text-sm font-medium text-gray-700">
							Jugador que asiste (opcional):
						</Label>
						<select
							id="assistBy"
							value={assistBy}
							onChange={(e) => setAssistBy(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
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
