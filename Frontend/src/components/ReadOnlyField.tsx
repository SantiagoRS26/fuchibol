"use client";

import React, { useRef, useState, useEffect } from "react";

type FieldPlayer = {
	id: string;
	name: string;
	photo?: string;
	x: number;
	y: number;
};

type ReadOnlyFieldProps = {
	players: FieldPlayer[];
};

export default function ReadOnlyField({ players }: ReadOnlyFieldProps) {
	const fieldRef = useRef<HTMLDivElement>(null);
	const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateFieldSize = () => {
			if (fieldRef.current) {
				setFieldSize({
					width: fieldRef.current.clientWidth,
					height: fieldRef.current.clientHeight,
				});
			}
		};
		updateFieldSize();
		window.addEventListener("resize", updateFieldSize);
		return () => window.removeEventListener("resize", updateFieldSize);
	}, []);

	return (
		<div
			ref={fieldRef}
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
			}}>
			{players.map((player) => {
				const leftPx = player.x * fieldSize.width;
				const topPx = player.y * fieldSize.height;

				return (
					<div
						key={player.id}
						style={{
							position: "absolute",
							left: leftPx,
							top: topPx,
							transform: "translate(-50%, -50%)",
							userSelect: "none",
							pointerEvents: "none",
							textAlign: "center",
						}}>
						{player.photo ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}>
								<img
									src={player.photo}
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
