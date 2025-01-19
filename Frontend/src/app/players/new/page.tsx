"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NewPlayerPage() {
	const [name, setName] = useState("");
	const [position, setPosition] = useState("Delantero");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name, position }),
				}
			);

			if (!res.ok) {
				// Manejo de errores
				console.error("Error al crear jugador");
				return;
			}

			// Redirigir al listado de jugadores o a la página del jugador nuevo
			router.push("/players");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="container mx-auto py-8">
			<Card className="max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Crear Jugador</CardTitle>
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
								placeholder="Ingresa el nombre del jugador"
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
						<Button type="submit">Crear</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
