"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function EditPlayerPage() {
	const router = useRouter();
	const params = useParams();
	const { id } = params;

	const [name, setName] = useState("");
	const [position, setPosition] = useState("Delantero");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPlayer = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/players/${id}`
				);
				if (!res.ok) {
					console.error("Error al obtener el jugador");
					return;
				}

				const data = await res.json();
				setName(data.name);
				setPosition(data.position);
				setLoading(false);
			} catch (error) {
				console.error(error);
			}
		};

		if (id) {
			fetchPlayer();
		}
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/players/${id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name, position }),
				}
			);

			if (!res.ok) {
				console.error("Error al actualizar jugador");
				return;
			}

			router.push("/players");
		} catch (error) {
			console.error(error);
		}
	};

	if (loading) {
		return <p className="container mx-auto py-8">Cargando...</p>;
	}

	return (
		<div className="container mx-auto py-8">
			<Card className="max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Editar Jugador</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<Label htmlFor="name">Nombre:</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="position">Posición:</Label>
							<select
								id="position"
								value={position}
								onChange={(e) => setPosition(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300">
								<option value="Delantero">Delantero</option>
								<option value="Defensa">Defensa</option>
								<option value="Centrocampista">Centrocampista</option>
								<option value="Portero">Portero</option>
								<option value="Lateral">Lateral</option>
							</select>
						</div>
						<Button type="submit">Guardar</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
