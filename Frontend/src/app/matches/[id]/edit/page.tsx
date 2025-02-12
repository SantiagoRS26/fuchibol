"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import CustomDragAndDropField from "@/components/CustomDragAndDropField";

type Player = {
	_id: string;
	name: string;
	profilePhoto?: string;
};

type TeamItemFromDB = {
	player: string | { _id: string; name: string };
	role: string;
	position?: {
		x: number;
		y: number;
	};
};

type MatchFromDB = {
	_id: string;
	date: string;
	teamA: TeamItemFromDB[];
	teamB: TeamItemFromDB[];
};

interface PlayerInTeam {
	playerId: string;
	role: string;
	x: number;
	y: number;
}

const roles = ["Delantero", "Defensa", "Centrocampista", "Portero", "Lateral"];

export default function EditMatchPage() {
	const router = useRouter();
	const { id } = useParams() as { id: string };

	const [date, setDate] = useState("");
	const [players, setPlayers] = useState<Player[]>([]);

	const [teamA, setTeamA] = useState<PlayerInTeam[]>([]);
	const [teamB, setTeamB] = useState<PlayerInTeam[]>([]);

	const [selectedPlayerA, setSelectedPlayerA] = useState("");
	const [roleA, setRoleA] = useState(roles[0]);
	const [selectedPlayerB, setSelectedPlayerB] = useState("");
	const [roleB, setRoleB] = useState(roles[0]);

	const [loading, setLoading] = useState(true);

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

				const dt = new Date(match.date);
				const iso = dt.toISOString().slice(0, 16);
				setDate(iso);

				const initialTeamA: PlayerInTeam[] = (match.teamA || []).map((item) => {
					const pId =
						typeof item.player === "object" && item.player !== null
							? item.player._id
							: (item.player as string);

					return {
						playerId: pId,
						role: item.role,
						x: item.position?.x ?? 0.5,
						y: item.position?.y ?? 0.5,
					};
				});

				const initialTeamB: PlayerInTeam[] = (match.teamB || []).map((item) => {
					const pId =
						typeof item.player === "object" && item.player !== null
							? item.player._id
							: (item.player as string);

					return {
						playerId: pId,
						role: item.role,
						x: item.position?.x ?? 0.5,
						y: item.position?.y ?? 0.5,
					};
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

	const usedPlayerIds = new Set([
		...teamA.map((item) => item.playerId),
		...teamB.map((item) => item.playerId),
	]);

	const availablePlayersForA = players.filter((p) => !usedPlayerIds.has(p._id));
	const availablePlayersForB = players.filter((p) => !usedPlayerIds.has(p._id));

	const handleAddPlayerToTeamA = () => {
		if (!selectedPlayerA) return;
		setTeamA((prev) => [
			...prev,
			{
				playerId: selectedPlayerA,
				role: roleA,
				x: 0.5,
				y: 0.5,
			},
		]);
		setSelectedPlayerA("");
		setRoleA(roles[0]);
	};

	const handleAddPlayerToTeamB = () => {
		if (!selectedPlayerB) return;
		setTeamB((prev) => [
			...prev,
			{
				playerId: selectedPlayerB,
				role: roleB,
				x: 0.5,
				y: 0.5,
			},
		]);
		setSelectedPlayerB("");
		setRoleB(roles[0]);
	};

	const handleRemoveFromTeamA = (index: number) => {
		setTeamA((prev) => prev.filter((_, i) => i !== index));
	};
	const handleRemoveFromTeamB = (index: number) => {
		setTeamB((prev) => prev.filter((_, i) => i !== index));
	};

	const fieldPlayers = [
		...teamA.map((item) => {
			const p = players.find((pl) => pl._id === item.playerId);
			return {
				id: item.playerId,
				name: p?.name || "Sin nombre",
				x: item.x,
				y: item.y,
				photoUrl: p?.profilePhoto || "",
			};
		}),
		...teamB.map((item) => {
			const p = players.find((pl) => pl._id === item.playerId);
			return {
				id: item.playerId,
				name: p?.name || "Sin nombre",
				x: item.x,
				y: item.y,
				photoUrl: p?.profilePhoto || "",
			};
		}),
	];

	const handlePositionChange = (
		playerId: string,
		newX: number,
		newY: number
	) => {
		setTeamA((prev) =>
			prev.map((item) =>
				item.playerId === playerId ? { ...item, x: newX, y: newY } : item
			)
		);
		setTeamB((prev) =>
			prev.map((item) =>
				item.playerId === playerId ? { ...item, x: newX, y: newY } : item
			)
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const localDate = new Date(date);
		const utcDate = new Date(
			localDate.getTime() - localDate.getTimezoneOffset() * 60000
		).toISOString();

		const updatedMatchData = {
			date: utcDate,
			teamA: teamA.map((item) => ({
				player: item.playerId,
				role: item.role,
				position: { x: item.x, y: item.y },
			})),
			teamB: teamB.map((item) => ({
				player: item.playerId,
				role: item.role,
				position: { x: item.x, y: item.y },
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
		<div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
			<Card className="max-w-7xl mx-auto shadow-xl border border-gray-200 rounded-lg overflow-hidden">
				<CardHeader className="bg-gray-100 px-6 py-4">
					<CardTitle className="text-2xl font-bold text-gray-800">
						Editar Partido
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 space-y-8">
					<form
						onSubmit={handleSubmit}
						className="space-y-6"
						aria-label="Editar partido">
						<div>
							<Label
								htmlFor="date"
								className="text-gray-800 font-semibold">
								Fecha/Hora:
							</Label>
							<Input
								id="date"
								type="datetime-local"
								className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
								value={date}
								onChange={(e) => setDate(e.target.value)}
							/>
						</div>

						<div className="flex flex-col md:flex-row md:space-x-8">
							{/* Equipo A */}
							<div className="flex-1">
								<h2 className="text-lg font-semibold text-gray-800 mb-3">
									Equipo A
								</h2>
								<div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
									<select
										className="rounded-md border-gray-300 w-full p-2 focus:ring-blue-500 focus:border-blue-500"
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
										className="rounded-md border-gray-300 w-full p-2 focus:ring-blue-500 focus:border-blue-500"
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
										className="bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
														className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500">
														Quitar
													</Button>
												</li>
											);
										})}
									</ul>
								)}
							</div>

							{/* Equipo B */}
							<div className="flex-1">
								<h2 className="text-lg font-semibold text-gray-800 mb-3">
									Equipo B
								</h2>
								<div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
									<select
										className="rounded-md border-gray-300 w-full p-2 focus:ring-blue-500 focus:border-blue-500"
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
										className="rounded-md border-gray-300 w-full p-2 focus:ring-blue-500 focus:border-blue-500"
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
										className="bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
														className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500">
														Quitar
													</Button>
												</li>
											);
										})}
									</ul>
								)}
							</div>
						</div>

						{/* Cancha para arrastrar jugadores */}
						<div className="mt-6">
							<h2 className="text-lg font-semibold text-gray-800 mb-4">
								Distribución en la Cancha
							</h2>
							<div
								className="border border-gray-300 rounded-md overflow-hidden shadow-sm"
								aria-label="Cancha de juego">
								{/* Se asume que dentro de CustomDragAndDropField se han realizado ajustes para una cancha más grande, especialmente en móviles */}
								<CustomDragAndDropField
									players={fieldPlayers}
									onPositionChange={handlePositionChange}
								/>
							</div>
						</div>

						<div>
							<Button
								type="submit"
								className="bg-green-600 text-white px-6 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500">
								Guardar Cambios
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
