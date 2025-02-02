import { notFound } from "next/navigation";
import AddGoalForm from "@/components/AddGoalForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReadOnlyField from "@/components/ReadOnlyField";

type PlayerInfo = {
	_id: string;
	name: string;
	position: string;
	profilePhoto?: string;
};

type GoalInfo = {
	_id?: string;
	player: PlayerInfo;
	assistBy?: PlayerInfo;
	time: number;
};

type TeamPlayer = {
	player: {
		_id: string;
		name: string;
		position?: string;
		profilePhoto?: string;
	};
	role: string;
	position?: {
		x: number;
		y: number;
	};
};

type Match = {
	_id: string;
	date: string;
	teamA: TeamPlayer[];
	teamB: TeamPlayer[];
	goals: GoalInfo[];
};

export default async function PlayerDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// Obtiene el partido
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${id}`
	);

	if (!res.ok) {
		return notFound();
	}

	const match: Match = await res.json();

	// Calcula el marcador comparando los IDs de los jugadores de cada equipo
	const teamAPlayerIds = match.teamA.map((item) => item.player._id);
	const teamBPlayerIds = match.teamB.map((item) => item.player._id);

	const teamAGoals = match.goals.filter((goal) =>
		teamAPlayerIds.includes(goal.player._id)
	).length;

	const teamBGoals = match.goals.filter((goal) =>
		teamBPlayerIds.includes(goal.player._id)
	).length;

	// Determina el resultado del partido
	let resultado = "";
	if (teamAGoals > teamBGoals) {
		resultado = "Equipo A gana";
	} else if (teamAGoals < teamBGoals) {
		resultado = "Equipo B gana";
	} else {
		resultado = "Empate";
	}

	// Construye el array de jugadores para visualizar posiciones
	const fieldPlayers = [
		...match.teamA.map((item) => ({
			id: item.player._id,
			name: item.player.name,
			photo: item.player.profilePhoto || "",
			x: item.position?.x ?? 0.5,
			y: item.position?.y ?? 0.5,
		})),
		...match.teamB.map((item) => ({
			id: item.player._id,
			name: item.player.name,
			photo: item.player.profilePhoto || "",
			x: item.position?.x ?? 0.5,
			y: item.position?.y ?? 0.5,
		})),
	];

	return (
		<main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
			<Card className="max-w-4xl mx-auto shadow-xl border border-gray-300 rounded-lg overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
					<CardTitle className="text-2xl font-bold text-white">
						Detalle del Partido
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 space-y-8">
					{/* Información básica del partido */}
					<section aria-labelledby="match-info">
						<h2
							id="match-info"
							className="sr-only">
							Información del Partido
						</h2>
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
							<p className="text-gray-800 font-medium">
								<span className="font-semibold">ID:</span> {match._id}
							</p>
							<p className="text-gray-800 font-medium">
								<span className="font-semibold">Fecha:</span>{" "}
								{new Date(match.date).toLocaleString("es-ES", {
									timeZone: "UTC",
									hour12: true,
									year: "numeric",
									month: "long",
									day: "2-digit",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
						</div>
					</section>

					{/* Sección de equipos */}
					<section
						aria-labelledby="teams"
						className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<article
							aria-label="Equipo A"
							className="bg-gray-50 p-4 rounded-lg shadow">
							<h3 className="text-xl font-semibold text-gray-700 mb-3">
								Equipo A
							</h3>
							{match.teamA?.length > 0 ? (
								<ul className="list-disc list-inside text-gray-600 space-y-1">
									{match.teamA.map((item, idx) => (
										<li key={idx}>
											{item.player.name}{" "}
											<span className="text-sm text-gray-500">
												({item.role})
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-gray-500">Sin jugadores.</p>
							)}
						</article>
						<article
							aria-label="Equipo B"
							className="bg-gray-50 p-4 rounded-lg shadow">
							<h3 className="text-xl font-semibold text-gray-700 mb-3">
								Equipo B
							</h3>
							{match.teamB?.length > 0 ? (
								<ul className="list-disc list-inside text-gray-600 space-y-1">
									{match.teamB.map((item, idx) => (
										<li key={idx}>
											{item.player.name}{" "}
											<span className="text-sm text-gray-500">
												({item.role})
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-gray-500">Sin jugadores.</p>
							)}
						</article>
					</section>

					{/* Marcador y resultado */}
					<section
						aria-labelledby="scoreboard"
						className="bg-white p-4 rounded-lg shadow border border-gray-200">
						<h3
							id="scoreboard"
							className="text-xl font-semibold text-gray-700 mb-3">
							Marcador
						</h3>
						<div className="flex flex-col sm:flex-row sm:justify-around items-center">
							<p className="text-gray-800 font-bold">
								<span className="mr-2">Equipo A:</span>
								<span className="text-blue-600">{teamAGoals}</span>
							</p>
							<p className="text-gray-800 font-bold">
								<span className="mr-2">Equipo B:</span>
								<span className="text-blue-600">{teamBGoals}</span>
							</p>
						</div>
						<p className="mt-4 text-center text-lg font-medium text-green-700">
							{resultado}
						</p>
					</section>

					{/* Sección de goles */}
					<section aria-labelledby="goals">
						<h3
							id="goals"
							className="text-xl font-semibold text-gray-700 mb-3">
							Goles
						</h3>
						{match.goals?.length > 0 ? (
							// Contenedor con altura fija y scroll vertical
							<div className="max-h-96 overflow-y-auto pr-2">
								<div className="grid gap-4">
									{match.goals.map((goal, idx) => (
										<div
											key={idx}
											className="flex items-center bg-white rounded-lg shadow p-4 border border-gray-100">
											{/* Badge del minuto */}
											<div className="flex-shrink-0">
												<div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white font-bold">
													{goal.time}'
												</div>
											</div>
											<div className="ml-4 flex-1">
												<div className="flex items-center">
													{/* Imagen o inicial del jugador */}
													{goal.player.profilePhoto ? (
														<img
															className="h-10 w-10 rounded-full object-cover mr-3"
															src={goal.player.profilePhoto}
															alt={goal.player.name}
														/>
													) : (
														<div className="h-10 w-10 flex items-center justify-center bg-blue-500 rounded-full text-white font-bold mr-3">
															{goal.player.name.charAt(0)}
														</div>
													)}
													<p className="text-gray-800 font-semibold">
														{goal.player?.name ?? "Desconocido"}
													</p>
												</div>
												{goal.assistBy && (
													<p className="mt-1 text-gray-600 text-sm">
														<span className="font-medium">Asistencia:</span>{" "}
														{goal.assistBy.name}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<p className="text-sm text-gray-500">No hay goles registrados.</p>
						)}
					</section>

					{/* Visualización de posiciones */}
					<section aria-labelledby="positions">
						<h3
							id="positions"
							className="text-xl font-semibold text-gray-700">
							Visualizar Posiciones
						</h3>
						<div className="mt-4">
							<ReadOnlyField players={fieldPlayers} />
						</div>
					</section>

					{/* Formulario para agregar goles */}
					<section aria-labelledby="add-goal">
						<h3
							id="add-goal"
							className="text-xl font-semibold text-gray-700">
							Registrar Nuevo Gol
						</h3>
						<div className="mt-4">
							<AddGoalForm matchId={match._id} />
						</div>
					</section>
				</CardContent>
			</Card>
		</main>
	);
}
