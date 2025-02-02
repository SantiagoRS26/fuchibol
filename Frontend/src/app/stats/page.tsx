import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Player = {
	_id: string;
	name: string;
	position: string;
	totalGoals: number;
	totalAssists: number;
	profilePhoto?: string;
};

export default async function StatsPage() {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`, {
		next: { revalidate: 0 },
	});
	const players: Player[] = await res.json();

	const topScorers = players
		.filter((player) => player.totalGoals > 0)
		.sort((a, b) => {
			if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
			if (b.totalAssists !== a.totalAssists)
				return b.totalAssists - a.totalAssists;
			return a.name.localeCompare(b.name);
		});

	const topAssists = players
		.filter((player) => player.totalAssists > 0)
		.sort((a, b) => {
			if (b.totalAssists !== a.totalAssists)
				return b.totalAssists - a.totalAssists;
			if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
			return a.name.localeCompare(b.name);
		});

	return (
		<main className="container mx-auto py-12 px-6">
			{/* Encabezado de la página */}
			<header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4">
				<h1 className="text-3xl font-extrabold text-gray-800 mb-4 md:mb-0">
					Estadísticas de Goles y Asistencias
				</h1>
				<Link href="/">
					<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors">
						Volver al inicio
					</Button>
				</Link>
			</header>

			{/* Se utiliza un grid responsivo para mostrar ambas tablas en columnas */}
			<section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Card para Top Goleadores */}
				<Card className="shadow-lg">
					<CardHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
						<CardTitle className="text-xl font-semibold text-gray-700">
							Top Goleadores
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						{topScorers.length > 0 ? (
							<div className="overflow-x-auto">
								<table
									className="min-w-full divide-y divide-gray-200"
									aria-label="Tabla de Top Goleadores">
									{/* La etiqueta caption es útil para usuarios de lectores de pantalla */}
									<caption className="sr-only">
										Tabla que muestra los jugadores con mayor cantidad de goles
									</caption>
									<thead className="bg-gray-100">
										<tr>
											<th
												scope="col"
												className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												#
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Jugador
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Posición
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Goles
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Asistencias
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{topScorers.map((player, index) => (
											<tr
												key={player._id}
												className="hover:bg-gray-50 transition-colors">
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
													{index + 1}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
													{player.name}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
													{player.position}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
													{player.totalGoals}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
													{player.totalAssists}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-gray-600">
								No hay jugadores con goles registrados.
							</p>
						)}
					</CardContent>
				</Card>

				{/* Card para Top Asistencias */}
				<Card className="shadow-lg">
					<CardHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
						<CardTitle className="text-xl font-semibold text-gray-700">
							Top Asistencias
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						{topAssists.length > 0 ? (
							<div className="overflow-x-auto">
								<table
									className="min-w-full divide-y divide-gray-200"
									aria-label="Tabla de Top Asistencias">
									<caption className="sr-only">
										Tabla que muestra los jugadores con mayor cantidad de
										asistencias
									</caption>
									<thead className="bg-gray-100">
										<tr>
											<th
												scope="col"
												className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												#
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Jugador
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Posición
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Asistencias
											</th>
											<th
												scope="col"
												className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Goles
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{topAssists.map((player, index) => (
											<tr
												key={player._id}
												className="hover:bg-gray-50 transition-colors">
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
													{index + 1}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
													{player.name}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
													{player.position}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
													{player.totalAssists}
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
													{player.totalGoals}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-gray-600">
								No hay jugadores con asistencias registradas.
							</p>
						)}
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
