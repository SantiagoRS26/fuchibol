import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DeleteMatchButton from "@/components/DeleteMatchButton";

type PlayerInfo = {
	_id: string;
	name: string;
	position: string;
};

type GoalInfo = {
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

export default async function MatchesPage() {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches`, {
		next: { revalidate: 0 }, // (opcional) deshabilita caché en dev
	  });
	  

	if (!res.ok) {
		return <p className="p-4 text-center text-red-500 font-semibold">Error al cargar los partidos</p>;
	}

	const matches: Match[] = await res.json();

	return (
		<div className="container mx-auto py-12 px-6">
			<div className="flex items-center justify-between mb-8 border-b pb-4">
				<h1 className="text-3xl font-extrabold text-gray-800">Partidos</h1>
				<Link href="/matches/new">
					<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
						Crear Partido
					</Button>
				</Link>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{matches.map((match) => (
					<Card key={match._id} className="shadow-lg border border-gray-200 rounded-lg overflow-hidden">
						<CardHeader className="bg-gray-100 px-4 py-3">
							<CardTitle className="text-lg font-bold text-gray-700">Partido: {match._id}</CardTitle>
						</CardHeader>
						<CardContent className="p-4 space-y-3">
							<p className="text-gray-600">
								<strong className="text-gray-800">Fecha:</strong> {" "}
								{new Date(match.date).toLocaleString("es-ES")}
							</p>
							<p className="text-gray-600">
								<strong className="text-gray-800">Goles Totales:</strong> {match.goals?.length ?? 0}
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<Link href={`/matches/${match._id}`}>
									<Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-100">
										Ver detalle
									</Button>
								</Link>
								<Link href={`/matches/${match._id}/edit`}>
									<Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
										Editar
									</Button>
								</Link>
								<DeleteMatchButton matchId={match._id} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
