"use client";

import React, { useRef, useState, useEffect, PointerEvent } from "react";

/**
 * Estructura para cada jugador en la cancha:
 *  - id: Identificador único.
 *  - name: Nombre a mostrar.
 *  - photoUrl?: URL de la foto de perfil (opcional).
 *  - x, y: Posición RELATIVA al contenedor (0..1).
 */
type FieldPlayer = {
	id: string;
	name: string;
	photoUrl?: string; // <- Agregamos esta propiedad
	x: number;
	y: number;
};

type DragAndDropFieldProps = {
	players: FieldPlayer[];
	/**
	 * Se dispara cada vez que un jugador cambia de posición.
	 */
	onPositionChange: (playerId: string, x: number, y: number) => void;
};

/**
 * Componente personalizado de Drag & Drop usando eventos nativos de pointer.
 */
export default function CustomDragAndDropField({
	players,
	onPositionChange,
}: DragAndDropFieldProps) {
	const fieldRef = useRef<HTMLDivElement>(null);

	// Dimensiones del contenedor, para calcular posiciones.
	const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });

	// ID del jugador que está siendo arrastrado actualmente.
	const [draggedId, setDraggedId] = useState<string | null>(null);

	// Offset del puntero con respecto a la esquina superior-izquierda del jugador.
	const [offset, setOffset] = useState({ dx: 0, dy: 0 });

	// Al montar, medimos el contenedor (y en cada resize).
	useEffect(() => {
		function updateFieldSize() {
			if (fieldRef.current) {
				setFieldSize({
					width: fieldRef.current.clientWidth,
					height: fieldRef.current.clientHeight,
				});
			}
		}
		updateFieldSize();
		window.addEventListener("resize", updateFieldSize);
		return () => window.removeEventListener("resize", updateFieldSize);
	}, []);

	/**
	 * Al presionar (pointer down) sobre un jugador, iniciamos el drag.
	 */
	const handlePointerDown = (
		playerId: string,
		e: PointerEvent<HTMLDivElement>
	) => {
		e.preventDefault();
		(e.target as Element).setPointerCapture(e.pointerId);
		setDraggedId(playerId);

		if (fieldRef.current) {
			const fieldRect = fieldRef.current.getBoundingClientRect();
			const itemRect = (e.target as HTMLElement).getBoundingClientRect();

			// Calculamos la diferencia entre puntero y esquina del div del jugador
			const offsetX = e.clientX - itemRect.left;
			const offsetY = e.clientY - itemRect.top;
			setOffset({ dx: offsetX, dy: offsetY });
		}
	};

	/**
	 * Al mover el puntero, si hay un jugador en drag, recalculamos su posición relativa
	 */
	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!draggedId) return; // No hay arrastre en curso
		e.preventDefault();
		if (!fieldRef.current) return;

		const fieldRect = fieldRef.current.getBoundingClientRect();
		let newLeft = e.clientX - fieldRect.left - offset.dx;
		let newTop = e.clientY - fieldRect.top - offset.dy;

		// Limitar a bordes
		if (newLeft < 0) newLeft = 0;
		if (newTop < 0) newTop = 0;
		if (newLeft > fieldSize.width) newLeft = fieldSize.width;
		if (newTop > fieldSize.height) newTop = fieldSize.height;

		// Convertimos a coords relativas (0..1)
		const relX = fieldSize.width ? newLeft / fieldSize.width : 0;
		const relY = fieldSize.height ? newTop / fieldSize.height : 0;

		onPositionChange(draggedId, relX, relY);
	};

	/** Al soltar, finalizamos el drag. */
	const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
		if (draggedId) setDraggedId(null);
	};

	return (
		<div
			ref={fieldRef}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			style={{
				width: "100%",
				height: 0,
				paddingBottom: "66%", // Mantén una proporción 16:9; ajusta según tu preferencia
				position: "relative",
				backgroundImage: `url("/campo-futbol.jpg")`, // Ajusta la ruta a tu imagen
				backgroundSize: "cover",
				backgroundPosition: "center",
				border: "2px solid #ccc",
				borderRadius: "8px",
			}}>
			{players.map((player) => {
				// Convertimos coords relativas en píxeles
				const left = player.x * fieldSize.width;
				const top = player.y * fieldSize.height;

				const photoSrc = player.photoUrl || "/default.png"; // fallback si no hay foto

				return (
					<div
						key={player.id}
						onPointerDown={(e) => handlePointerDown(player.id, e)}
						style={{
							position: "absolute",
							left,
							top,
							transform: "translate(-50%, -50%)",
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							borderRadius: "8px",
							padding: "6px",
							userSelect: "none",
							cursor: "grab",
							boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
							width: "80px",
							textAlign: "center",
						}}>
						{/* Foto del jugador arriba */}
						<img
							src={photoSrc}
							alt={player.name}
							style={{
								width: "60px",
								height: "60px",
								objectFit: "cover",
								borderRadius: "50%",
								margin: "0 auto",
							}}
						/>
						{/* Nombre del jugador abajo */}
						<p style={{ fontSize: "0.7rem", marginTop: "4px" }}>
							{player.name}
						</p>
					</div>
				);
			})}
		</div>
	);
}
