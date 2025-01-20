import { notFound } from "next/navigation";
import AddGoalForm from "@/components/AddGoalForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type PlayerInfo = {
	_id: string;
	name: string;
	position: string;
};

type GoalInfo = {
	_id?: string;
	player: PlayerInfo;
	assistBy?: PlayerInfo;
	time: number;
};

type TeamPlayer = {
	player: PlayerInfo;
	role: string;
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
	const id = (await params).id;

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${id}`);

	if (!res.ok) {
		return notFound();
	}

	const match: Match = await res.json();

	return (
		<div className="container mx-auto py-12 px-6">
			<Card className="max-w-3xl mx-auto shadow-lg border border-gray-200 rounded-lg overflow-hidden">
				<CardHeader className="bg-gray-100 px-6 py-4">
					<CardTitle className="text-2xl font-bold text-gray-800">
						Detalle del Partido
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 space-y-6">
					<p className="text-gray-700">
						<strong className="text-gray-800">ID:</strong> {match._id}
					</p>
					<p className="text-gray-700">
						<strong className="text-gray-800">Fecha:</strong>{" "}
						{new Date(match.date).toLocaleString("es-ES")}
					</p>

					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-2">
							Equipo A
						</h3>
						{match.teamA?.length > 0 ? (
							<ul className="list-disc list-inside text-gray-700">
								{match.teamA.map((item, idx) => (
									<li key={idx}>
										{item.player.name} - {item.role}
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-gray-600">Sin jugadores.</p>
						)}
					</div>

					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-2">
							Equipo B
						</h3>
						{match.teamB?.length > 0 ? (
							<ul className="list-disc list-inside text-gray-700">
								{match.teamB.map((item, idx) => (
									<li key={idx}>
										{item.player.name} - {item.role}
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-gray-600">Sin jugadores.</p>
						)}
					</div>

					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-2">Goles</h3>
						{match.goals?.length > 0 ? (
							<ul className="list-disc list-inside text-gray-700">
								{match.goals.map((goal, idx) => (
									<li
										key={idx}
										className="py-2">
										<p>
											<strong className="text-gray-800">
												Min. {goal.time}
											</strong>{" "}
											- {goal.player?.name ?? "Desconocido"}
											{goal.assistBy && (
												<span className="text-sm text-gray-500">
													{" "}
													(Asistencia: {goal.assistBy.name})
												</span>
											)}
										</p>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-gray-600">No hay goles registrados.</p>
						)}
					</div>

					<AddGoalForm matchId={match._id} />
				</CardContent>
			</Card>
		</div>
	);
}