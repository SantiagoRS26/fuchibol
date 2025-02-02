"use client";

import React, { useRef, useState, useEffect, PointerEvent } from "react";

type FieldPlayer = {
	id: string;
	name: string;
	photoUrl?: string;
	x: number;
	y: number;
};

type DragAndDropFieldProps = {
	players: FieldPlayer[];
	onPositionChange: (playerId: string, x: number, y: number) => void;
};

export default function CustomDragAndDropField({
	players,
	onPositionChange,
}: DragAndDropFieldProps) {
	const fieldRef = useRef<HTMLDivElement>(null);
	const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const [offset, setOffset] = useState({ dx: 0, dy: 0 });

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

	const handlePointerDown = (
		playerId: string,
		e: PointerEvent<HTMLDivElement>
	) => {
		e.preventDefault();
		(e.target as Element).setPointerCapture(e.pointerId);
		setDraggedId(playerId);

		if (fieldRef.current) {
			const itemRect = (e.target as HTMLElement).getBoundingClientRect();
			const offsetX = e.clientX - itemRect.left;
			const offsetY = e.clientY - itemRect.top;
			setOffset({ dx: offsetX, dy: offsetY });
		}
	};

	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!draggedId) return;
		e.preventDefault();
		if (!fieldRef.current) return;

		const fieldRect = fieldRef.current.getBoundingClientRect();
		let newLeft = e.clientX - fieldRect.left - offset.dx;
		let newTop = e.clientY - fieldRect.top - offset.dy;

		if (newLeft < 0) newLeft = 0;
		if (newTop < 0) newTop = 0;
		if (newLeft > fieldSize.width) newLeft = fieldSize.width;
		if (newTop > fieldSize.height) newTop = fieldSize.height;

		const relX = fieldSize.width ? newLeft / fieldSize.width : 0;
		const relY = fieldSize.height ? newTop / fieldSize.height : 0;

		onPositionChange(draggedId, relX, relY);
	};

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
				paddingBottom: "66%",
				position: "relative",
				backgroundImage: `url("/campo-futbol.jpg")`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				border: "2px solid #ccc",
				borderRadius: "8px",
				marginTop: "1rem",
				touchAction: "none", // <-- Se agrega para dispositivos táctiles
			}}>
			{players.map((player) => {
				const leftPx = player.x * fieldSize.width;
				const topPx = player.y * fieldSize.height;

				return (
					<div
						key={player.id}
						onPointerDown={(e) => handlePointerDown(player.id, e)}
						style={{
							position: "absolute",
							left: leftPx,
							top: topPx,
							transform: "translate(-50%, -50%)",
							userSelect: "none",
							cursor: "grab",
							textAlign: "center",
						}}>
						{player.photoUrl ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}>
								<img
									src={player.photoUrl}
									alt={player.name}
									style={{
										width: "40px",
										height: "40px",
										borderRadius: "50%",
										objectFit: "cover",
										border: "2px solid #FFF",
										boxShadow: "0 0 5px rgba(0,0,0,0.3)",
									}}
								/>
								<span
									style={{
										marginTop: "4px",
										fontSize: "0.75rem",
										fontWeight: 500,
										color: "#fff",
										textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
									}}>
									{player.name}
								</span>
							</div>
						) : (
							<div
								style={{
									backgroundColor: "rgba(255, 255, 255, 0.9)",
									borderRadius: "4px",
									padding: "4px 8px",
									fontSize: "0.8rem",
								}}>
								{player.name}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
