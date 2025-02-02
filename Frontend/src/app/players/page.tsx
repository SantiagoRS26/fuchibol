import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Player = {
	_id: string;
	name: string;
	position: string;
	totalGoals: number;
	totalAssists: number;
	profilePhoto?: string;
};

export default async function PlayersPage() {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`, {
		next: { revalidate: 0 },
	});

	const players: Player[] = await res.json();

	return (
		<div className="container mx-auto py-12 px-6">
			<div className="flex justify-between items-center mb-8 border-b pb-4">
				<h1 className="text-3xl font-extrabold text-gray-800">
					Lista de Jugadores
				</h1>
				<Link href="/players/new">
					<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
						Crear Jugador
					</Button>
				</Link>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{players.map((player) => {
					const photoSrc = player.profilePhoto || "/default.png";

					return (
						<Card
							key={player._id}
							className="shadow-lg border border-gray-200 rounded-lg overflow-hidden">
							<CardHeader className="flex flex-col items-center justify-center bg-gray-100 px-4 py-5 relative">
								<img
									src={photoSrc}
									alt={`Foto de perfil de ${player.name}`}
									className="w-36 h-36 rounded-full object-cover border-2 border-white shadow-md"
								/>
								<CardTitle className="mt-3 text-xl font-bold text-gray-700">
									{player.name}
								</CardTitle>
							</CardHeader>

							<CardContent className="p-4 space-y-3">
								<p className="text-gray-600">
									<strong className="text-gray-800">Posición:</strong>{" "}
									{player.position}
								</p>
								<p className="text-gray-600">
									<strong className="text-gray-800">Goles totales:</strong>{" "}
									{player.totalGoals}
								</p>
								<p className="text-gray-600">
									<strong className="text-gray-800">
										Asistencias totales:
									</strong>{" "}
									{player.totalAssists}
								</p>
								<div className="mt-4 flex flex-wrap gap-2">
									<Link href={`/players/${player._id}`}>
										<Button
											variant="outline"
											className="border-blue-500 text-blue-500 hover:bg-blue-100">
											Ver detalles
										</Button>
									</Link>
									<Link href={`/players/${player._id}/edit`}>
										<Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
											Editar
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
