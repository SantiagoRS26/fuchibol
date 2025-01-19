"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DeleteMatchButtonProps {
	matchId: string;
}

const DeleteMatchButton: FC<DeleteMatchButtonProps> = ({ matchId }) => {
	const router = useRouter();

	const handleDelete = async () => {
		const confirmed = confirm(
			"\u00bfEst\u00e1s seguro de eliminar este partido?"
		);
		if (!confirmed) return;

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}`,
				{
					method: "DELETE",
				}
			);
			if (!res.ok) {
				throw new Error("Error al eliminar el partido.");
			}

			alert("Partido eliminado exitosamente.");
			router.refresh();
		} catch (error) {
			console.error("Error:", error);
			alert("Ocurri\u00f3 un error al eliminar el partido. Intenta de nuevo.");
		}
	};

	return (
		<Button
			variant="destructive"
			className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
			onClick={handleDelete}>
			Eliminar
		</Button>
	);
};

export default DeleteMatchButton;
