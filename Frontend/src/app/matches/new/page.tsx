"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const roles = ["Delantero", "Defensa", "Centrocampista", "Portero", "Lateral"];

// Estructura para equipo
interface PlayerInTeam {
	playerId: string;
	role: string;
	x: number; // 0..1
	y: number; // 0..1
}

export default function NewMatchPage() {
	const router = useRouter();
	const [date, setDate] = useState("");

	const [players, setPlayers] = useState<Player[]>([]);

	// Arrays de jugadores en cada equipo (con x,y para su posición)
	const [teamA, setTeamA] = useState<PlayerInTeam[]>([]);
	const [teamB, setTeamB] = useState<PlayerInTeam[]>([]);

	// Datos para agregar un jugador al equipo
	const [selectedPlayerA, setSelectedPlayerA] = useState("");
	const [roleA, setRoleA] = useState(roles[0]);
	const [selectedPlayerB, setSelectedPlayerB] = useState("");
	const [roleB, setRoleB] = useState(roles[0]);

	useEffect(() => {
		// Cargar jugadores
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

	// IDs usados
	const usedPlayerIds = new Set([
		...teamA.map((item) => item.playerId),
		...teamB.map((item) => item.playerId),
	]);

	// Disponibles para cada select
	const availablePlayersForA = players.filter((p) => !usedPlayerIds.has(p._id));
	const availablePlayersForB = players.filter((p) => !usedPlayerIds.has(p._id));

	// Agregar jugador a Team A (posición inicial en el centro)
	const handleAddPlayerToTeamA = () => {
		if (!selectedPlayerA) return;
		setTeamA((prev) => [
			...prev,
			{ playerId: selectedPlayerA, role: roleA, x: 0.5, y: 0.5 },
		]);
		setSelectedPlayerA("");
		setRoleA(roles[0]);
	};

	// Agregar jugador a Team B
	const handleAddPlayerToTeamB = () => {
		if (!selectedPlayerB) return;
		setTeamB((prev) => [
			...prev,
			{ playerId: selectedPlayerB, role: roleB, x: 0.5, y: 0.5 },
		]);
		setSelectedPlayerB("");
		setRoleB(roles[0]);
	};

	// Eliminar jugador de Team A
	const handleRemoveFromTeamA = (index: number) => {
		setTeamA((prev) => prev.filter((_, i) => i !== index));
	};

	// Eliminar jugador de Team B
	const handleRemoveFromTeamB = (index: number) => {
		setTeamB((prev) => prev.filter((_, i) => i !== index));
	};

	// Combinar ambos equipos para mostrarlos en la cancha
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

	// Actualizar posición en Team A o B
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
		// Estructura para enviar
		const matchData = {
			date,
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
			goals: [],
		};

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(matchData),
				}
			);
			if (!res.ok) {
				console.error("Error al crear el partido");
				return;
			}
			router.push("/matches");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="container mx-auto py-8">
			<Card>
				<CardHeader>
					<CardTitle>Crear Partido</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<Label htmlFor="date">Fecha/Hora:</Label>
							<Input
								id="date"
								type="datetime-local"
								value={date}
								onChange={(e) => setDate(e.target.value)}
							/>
						</div>

						<div className="flex flex-col md:flex-row md:space-x-4">
							{/* Equipo A */}
							<div className="flex-1">
								<h2 className="text-lg font-semibold mb-2">Equipo A</h2>
								<div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-3">
									<select
										className="rounded-md border-gray-300"
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
										className="rounded-md border-gray-300"
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
										type="button"
										onClick={handleAddPlayerToTeamA}>
										Agregar A
									</Button>
								</div>

								{teamA.length > 0 && (
									<ul className="space-y-1">
										{teamA.map((item, index) => {
											const playerObj = players.find(
												(p) => p._id === item.playerId
											);
											return (
												<li
													key={index}
													className="flex justify-between">
													<span>
														{playerObj?.name} - {item.role}
													</span>
													<Button
														variant="destructive"
														onClick={() => handleRemoveFromTeamA(index)}
														type="button">
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
								<h2 className="text-lg font-semibold mb-2">Equipo B</h2>
								<div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-3">
									<select
										className="rounded-md border-gray-300"
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
										className="rounded-md border-gray-300"
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
										type="button"
										onClick={handleAddPlayerToTeamB}>
										Agregar B
									</Button>
								</div>

								{teamB.length > 0 && (
									<ul className="space-y-1">
										{teamB.map((item, index) => {
											const playerObj = players.find(
												(p) => p._id === item.playerId
											);
											return (
												<li
													key={index}
													className="flex justify-between">
													<span>
														{playerObj?.name} - {item.role}
													</span>
													<Button
														variant="destructive"
														onClick={() => handleRemoveFromTeamB(index)}
														type="button">
														Quitar
													</Button>
												</li>
											);
										})}
									</ul>
								)}
							</div>
						</div>

						{/* Cancha para arrastrar y soltar jugadores de AMBOS equipos */}
						<h2 className="text-lg font-semibold mb-2">
							Distribución en la Cancha
						</h2>
						<CustomDragAndDropField
							players={fieldPlayers}
							onPositionChange={handlePositionChange}
						/>

						<Button type="submit">Crear Partido</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
