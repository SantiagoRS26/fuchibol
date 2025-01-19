import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type MatchHistoryItem = {
	matchId: string;
	role: string;
	goals: number;
	assists: number;
};

type Player = {
	_id: string;
	name: string;
	position: string;
	totalGoals: number;
	totalAssists: number;
	matchHistory: MatchHistoryItem[];
};

export default async function PlayerDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/players/${id}`,
		{
			next: { revalidate: 0 },
		}
	);

	if (!res.ok) {
		return notFound();
	}

	const player: Player = await res.json();

	return (
		<div className="container mx-auto py-12 px-6">
			<Card className="max-w-3xl mx-auto shadow-lg border border-gray-200 rounded-lg overflow-hidden">
				<CardHeader className="bg-gray-100 px-6 py-4">
					<CardTitle className="text-2xl font-bold text-gray-800">
						Detalle de Jugador
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<h2 className="text-xl font-semibold text-gray-700">{player.name}</h2>
					<p className="text-gray-600">
						<strong className="text-gray-800">Posición:</strong>{" "}
						{player.position}
					</p>
					<p className="text-gray-600">
						<strong className="text-gray-800">Goles totales:</strong>{" "}
						{player.totalGoals}
					</p>
					<p className="text-gray-600">
						<strong className="text-gray-800">Asistencias totales:</strong>{" "}
						{player.totalAssists}
					</p>

					<div className="mt-6">
						<h3 className="text-lg font-medium text-gray-800 mb-3">
							Historial de Partidos
						</h3>
						{player.matchHistory && player.matchHistory.length > 0 ? (
							<ul className="list-disc list-inside space-y-2 text-gray-600">
								{player.matchHistory.map((match) => (
									<li
										key={match.matchId}
										className="bg-gray-50 p-3 rounded-md border border-gray-200">
										<span className="font-semibold text-gray-800">
											Partido:
										</span>{" "}
										{match.matchId} <br />
										<span className="font-semibold text-gray-800">
											Rol:
										</span>{" "}
										{match.role} <br />
										<span className="font-semibold text-gray-800">
											Goles:
										</span>{" "}
										{match.goals} <br />
										<span className="font-semibold text-gray-800">
											Asistencias:
										</span>{" "}
										{match.assists}
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-gray-600">
								Sin historial de partidos.
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
