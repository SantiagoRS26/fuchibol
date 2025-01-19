"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Player = {
	_id: string;
	name: string;
};

type TeamItemFromDB = {
	player: string | { _id: string; name: string }; // Puede ser populado o solo el ID
	role: string;
};

type MatchFromDB = {
	_id: string;
	date: string;
	teamA: TeamItemFromDB[];
	teamB: TeamItemFromDB[];
	// goals: ...
};

const roles = ["Delantero", "Defensa", "Centrocampista", "Portero", "Lateral"];

export default function EditMatchPage() {
	const router = useRouter();
	const { id } = useParams() as { id: string };

	// Fecha
	const [date, setDate] = useState("");
	// Todos los jugadores
	const [players, setPlayers] = useState<Player[]>([]);

	// Arreglos de { playerId, role } para cada equipo
	const [teamA, setTeamA] = useState<{ playerId: string; role: string }[]>([]);
	const [teamB, setTeamB] = useState<{ playerId: string; role: string }[]>([]);

	// Estados temporales para la asignación
	const [selectedPlayerA, setSelectedPlayerA] = useState("");
	const [roleA, setRoleA] = useState(roles[0]);
	const [selectedPlayerB, setSelectedPlayerB] = useState("");
	const [roleB, setRoleB] = useState(roles[0]);

	const [loading, setLoading] = useState(true);

	// 1. Cargar la lista de jugadores
	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`
				);
				const data = await res.json();
				setPlayers(data);
			} catch (error) {
				console.error(error);
			}
		};
		fetchPlayers();
	}, []);

	// 2. Cargar el partido
	useEffect(() => {
		const fetchMatch = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${id}`
				);
				if (!res.ok) {
					console.error("Error al obtener el partido");
					return;
				}

				const match: MatchFromDB = await res.json();

				// Formatear fecha/hora para <input type="datetime-local">
				const dt = new Date(match.date);
				const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
					.toISOString()
					.slice(0, 16);
				setDate(iso);

				// Transformar teamA, teamB a { playerId, role }
				const initialTeamA = (match.teamA || []).map((item) => {
					// Si item.player es un objeto populado { _id, name }, toma el _id
					if (typeof item.player === "object" && item.player !== null) {
						return {
							playerId: item.player._id,
							role: item.role,
						};
					} else {
						// Si viene sin popular => es un string con la ID
						return {
							playerId: item.player as string,
							role: item.role,
						};
					}
				});

				const initialTeamB = (match.teamB || []).map((item) => {
					if (typeof item.player === "object" && item.player !== null) {
						return {
							playerId: item.player._id,
							role: item.role,
						};
					} else {
						return {
							playerId: item.player as string,
							role: item.role,
						};
					}
				});

				setTeamA(initialTeamA);
				setTeamB(initialTeamB);

				setLoading(false);
			} catch (error) {
				console.error(error);
			}
		};

		if (id) {
			fetchMatch();
		}
	}, [id]);

	// 3. Filtrar jugadores para no repetir
	const usedPlayerIds = new Set([
		...teamA.map((item) => item.playerId),
		...teamB.map((item) => item.playerId),
	]);

	const availablePlayersForA = players.filter((p) => !usedPlayerIds.has(p._id));
	const availablePlayersForB = players.filter((p) => !usedPlayerIds.has(p._id));

	// 4. Funciones para agregar/quitar jugadores
	const handleAddPlayerToTeamA = () => {
		if (!selectedPlayerA) return;
		setTeamA((prev) => [...prev, { playerId: selectedPlayerA, role: roleA }]);
		setSelectedPlayerA("");
		setRoleA(roles[0]);
	};

	const handleAddPlayerToTeamB = () => {
		if (!selectedPlayerB) return;
		setTeamB((prev) => [...prev, { playerId: selectedPlayerB, role: roleB }]);
		setSelectedPlayerB("");
		setRoleB(roles[0]);
	};

	const handleRemoveFromTeamA = (index: number) => {
		setTeamA((prev) => prev.filter((_, i) => i !== index));
	};

	const handleRemoveFromTeamB = (index: number) => {
		setTeamB((prev) => prev.filter((_, i) => i !== index));
	};

	// 5. Actualizar partido (PUT)
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const updatedMatchData = {
			date,
			teamA: teamA.map((item) => ({
				player: item.playerId,
				role: item.role,
			})),
			teamB: teamB.map((item) => ({
				player: item.playerId,
				role: item.role,
			})),
		};

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updatedMatchData),
				}
			);

			if (!res.ok) {
				console.error("Error al actualizar partido");
				return;
			}

			router.push("/matches");
		} catch (error) {
			console.error(error);
		}
	};

	if (loading) {
		return <p className="container mx-auto py-8">Cargando partido...</p>;
	}

	return (
		<div className="container mx-auto py-12 px-6">
			<Card className="max-w-3xl mx-auto shadow-lg border border-gray-200 rounded-lg overflow-hidden">
				<CardHeader className="bg-gray-100 px-6 py-4">
					<CardTitle className="text-2xl font-bold text-gray-800">
						Editar Partido
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 space-y-6">
					<form
						onSubmit={handleSubmit}
						className="space-y-6">
						<div>
							<Label
								htmlFor="date"
								className="text-gray-800 font-semibold">
								Fecha/Hora:
							</Label>
							<Input
								id="date"
								type="datetime-local"
								className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
								value={date}
								onChange={(e) => setDate(e.target.value)}
							/>
						</div>

						<div className="flex flex-col md:flex-row md:space-x-8">
							<div className="flex-1">
								<h2 className="text-lg font-semibold text-gray-800 mb-3">
									Equipo A
								</h2>
								<div className="flex flex-col md:flex-row md:space-x-4 mb-4">
									<select
										className="rounded-md border-gray-300 w-full p-2"
										value={selectedPlayerA}
										onChange={(e) => setSelectedPlayerA(e.target.value)}>
										<option value="">-- Seleccionar Jugador --</option>
										{availablePlayersForA.map((p) => (
											<option
												key={p._id}
												value={p._id}>
												{p.name}
											</option>
										))}
									</select>
									<select
										className="rounded-md border-gray-300 w-full p-2"
										value={roleA}
										onChange={(e) => setRoleA(e.target.value)}>
										{roles.map((role) => (
											<option
												key={role}
												value={role}>
												{role}
											</option>
										))}
									</select>
									<Button
										onClick={handleAddPlayerToTeamA}
										type="button"
										className="bg-blue-600 text-white px-4 py-2 rounded-md">
										Agregar A
									</Button>
								</div>

								{teamA.length > 0 && (
									<ul className="space-y-2">
										{teamA.map((item, index) => {
											const playerObj = players.find(
												(p) => p._id === item.playerId
											);
											return (
												<li
													key={index}
													className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
													<span className="text-gray-700">
														{playerObj?.name} - {item.role}
													</span>
													<Button
														variant="destructive"
														onClick={() => handleRemoveFromTeamA(index)}
														type="button"
														className="text-red-600 hover:text-red-800">
														Quitar
													</Button>
												</li>
											);
										})}
									</ul>
								)}
							</div>

							<div className="flex-1">
								<h2 className="text-lg font-semibold text-gray-800 mb-3">
									Equipo B
								</h2>
								<div className="flex flex-col md:flex-row md:space-x-4 mb-4">
									<select
										className="rounded-md border-gray-300 w-full p-2"
										value={selectedPlayerB}
										onChange={(e) => setSelectedPlayerB(e.target.value)}>
										<option value="">-- Seleccionar Jugador --</option>
										{availablePlayersForB.map((p) => (
											<option
												key={p._id}
												value={p._id}>
												{p.name}
											</option>
										))}
									</select>
									<select
										className="rounded-md border-gray-300 w-full p-2"
										value={roleB}
										onChange={(e) => setRoleB(e.target.value)}>
										{roles.map((role) => (
											<option
												key={role}
												value={role}>
												{role}
											</option>
										))}
									</select>
									<Button
										onClick={handleAddPlayerToTeamB}
										type="button"
										className="bg-blue-600 text-white px-4 py-2 rounded-md">
										Agregar B
									</Button>
								</div>

								{teamB.length > 0 && (
									<ul className="space-y-2">
										{teamB.map((item, index) => {
											const playerObj = players.find(
												(p) => p._id === item.playerId
											);
											return (
												<li
													key={index}
													className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
													<span className="text-gray-700">
														{playerObj?.name} - {item.role}
													</span>
													<Button
														variant="destructive"
														onClick={() => handleRemoveFromTeamB(index)}
														type="button"
														className="text-red-600 hover:text-red-800">
														Quitar
													</Button>
												</li>
											);
										})}
									</ul>
								)}
							</div>
						</div>

						<Button
							type="submit"
							className="bg-green-600 text-white px-6 py-2 rounded-md">
							Guardar Cambios
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
