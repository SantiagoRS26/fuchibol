"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Importamos react-select de forma dinámica (solo se renderiza en el cliente)
const Select = dynamic(() => import("react-select"), { ssr: false });

// Interfaz para las opciones de react-select
interface OptionType {
	value: string;
	label: string;
}

// Función para convertir una fecha (string o Date) a hora colombiana.
const convertToColombianTime = (dateInput: string | Date): string => {
	if (!dateInput) return "";
	const date = new Date(dateInput);
	return date.toLocaleString("es-CO", { timeZone: "America/Bogota" });
};

interface AddGoalFormProps {
	matchId: string;
}

export default function AddGoalForm({ matchId }: AddGoalFormProps) {
	const router = useRouter();

	const [matchInfo, setMatchInfo] = useState<any>(null);
	const [timer, setTimer] = useState(0);
	const [showStartModal, setShowStartModal] = useState(false);
	const [showStopModal, setShowStopModal] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [selectedPlayer, setSelectedPlayer] = useState<OptionType | null>(null);
	const [selectedAssist, setSelectedAssist] = useState<OptionType | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Función para obtener la información actual del partido
	const fetchMatchInfo = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}`
			);
			if (res.ok) {
				const data = await res.json();
				setMatchInfo(data);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchMatchInfo();
	}, []);

	// Efecto para actualizar el contador si el partido está activo
	useEffect(() => {
		let interval: number;
		if (matchInfo && matchInfo.status === "active" && matchInfo.startTime) {
			const startTime = new Date(matchInfo.startTime).getTime();
			interval = window.setInterval(() => {
				const now = Date.now();
				const elapsedMinutes = Math.floor((now - startTime) / 60000);
				setTimer(elapsedMinutes);
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [matchInfo]);

	// Genera las opciones de react-select a partir de los jugadores del partido (teamA y teamB)
	const playersOptions: OptionType[] = matchInfo
		? (() => {
				const playersMap = new Map<string, any>();
				[...(matchInfo.teamA || []), ...(matchInfo.teamB || [])].forEach(
					(item: any) => {
						if (item.player?._id) {
							playersMap.set(item.player._id, item.player);
						}
					}
				);
				return Array.from(playersMap.values()).map((p: any) => ({
					value: p._id,
					label: p.name,
				}));
		  })()
		: [];

	const confirmStartMatch = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}/start`,
				{ method: "POST" }
			);
			if (!res.ok) {
				setErrorMsg("Error al iniciar el partido.");
				return;
			}
			await fetchMatchInfo();
			setShowStartModal(false);
		} catch (error) {
			console.error(error);
			setErrorMsg("Error en la conexión. Intenta más tarde.");
		}
	};

	const confirmStopMatch = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}/stop`,
				{ method: "POST" }
			);
			if (!res.ok) {
				setErrorMsg("Error al detener el partido.");
				return;
			}
			await fetchMatchInfo();
			setShowStopModal(false);
		} catch (error) {
			console.error(error);
			setErrorMsg("Error en la conexión. Intenta más tarde.");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg("");

		if (!selectedPlayer) {
			setErrorMsg("Debes seleccionar un jugador que anote.");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}/goals`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						player: selectedPlayer.value,
						assistBy: selectedAssist ? selectedAssist.value : null,
					}),
				}
			);

			if (!res.ok) {
				setErrorMsg("Error al agregar gol. Por favor, intenta nuevamente.");
				setIsSubmitting(false);
				return;
			}
			router.refresh();
			setSelectedPlayer(null);
			setSelectedAssist(null);
		} catch (error) {
			console.error(error);
			setErrorMsg("Error en la conexión. Intenta más tarde.");
		}
		setIsSubmitting(false);
	};

	return (
		<Card className="max-w-md mx-auto">
			<CardHeader className="bg-green-500 text-white px-4 py-3 rounded-t-md">
				<CardTitle className="text-lg font-bold">Control del Partido</CardTitle>
			</CardHeader>
			<CardContent className="px-4 py-6">
				{errorMsg && (
					<div className="mb-4 text-red-600 text-sm">{errorMsg}</div>
				)}

				{/* Botones para iniciar/detener el partido */}
				<div className="mb-4">
					<Button
						onClick={() => setShowStartModal(true)}
						disabled={matchInfo?.status === "active"}
						className="mr-2">
						Iniciar Partido
					</Button>
					<Button
						onClick={() => setShowStopModal(true)}
						disabled={matchInfo?.status !== "active"}>
						Detener Partido
					</Button>
				</div>

				{/* Mostrar información del partido */}
				{matchInfo && (
					<div className="mb-4">
						{matchInfo.startTime && (
							<p>
								<strong>Inicio del partido:</strong>{" "}
								{convertToColombianTime(matchInfo.startTime)}
							</p>
						)}
						{matchInfo.endTime && (
							<p>
								<strong>Fin del partido:</strong>{" "}
								{convertToColombianTime(matchInfo.endTime)}
							</p>
						)}
					</div>
				)}

				{/* Mostrar el contador si el partido está activo */}
				{matchInfo && matchInfo.status === "active" && (
					<div className="mb-4">
						<p>
							Tiempo transcurrido: <strong>{timer}</strong> minuto(s)
						</p>
					</div>
				)}

				{/* Formulario para registrar gol */}
				<form
					onSubmit={handleSubmit}
					className="space-y-5">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Jugador que anota:
						</label>
						<Select
							options={playersOptions}
							onChange={(option) =>
								setSelectedPlayer(option as OptionType | null)
							}
							value={selectedPlayer}
							placeholder="Selecciona el jugador que anota..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Jugador que asiste (opcional):
						</label>
						<Select
							options={playersOptions}
							onChange={(option) =>
								setSelectedAssist(option as OptionType | null)
							}
							value={selectedAssist}
							placeholder="Selecciona el jugador que asiste..."
							isClearable
						/>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting || matchInfo?.status !== "active"}
						className="w-full">
						{isSubmitting ? "Registrando..." : "Registrar Gol"}
					</Button>
				</form>
			</CardContent>

			{/* Modal para iniciar el partido */}
			{showStartModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
						<p className="mb-4 text-gray-800">
							¿Estás seguro de que deseas <strong>iniciar</strong> el partido?
						</p>
						<div className="flex justify-end space-x-2">
							<Button
								onClick={() => setShowStartModal(false)}
								variant="outline">
								Cancelar
							</Button>
							<Button onClick={confirmStartMatch}>Confirmar</Button>
						</div>
					</div>
				</div>
			)}

			{/* Modal para detener el partido */}
			{showStopModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
						<p className="mb-4 text-gray-800">
							¿Estás seguro de que deseas <strong>detener</strong> el partido?
						</p>
						<div className="flex justify-end space-x-2">
							<Button
								onClick={() => setShowStopModal(false)}
								variant="outline">
								Cancelar
							</Button>
							<Button onClick={confirmStopMatch}>Confirmar</Button>
						</div>
					</div>
				</div>
			)}
		</Card>
	);
}
