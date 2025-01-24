"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

async function uploadImageToCloudinary(file: File) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", "player_photos");

	const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "";

	try {
		const res = await fetch(cloudinaryUrl, {
			method: "POST",
			body: formData,
		});
		const data = await res.json();

		if (data.secure_url) {
			return data.secure_url;
		} else {
			console.error("Error subiendo a Cloudinary:", data);
			return "";
		}
	} catch (error) {
		console.error("Error al subir la imagen a Cloudinary:", error);
		return "";
	}
}

export default function NewPlayerPage() {
	const [name, setName] = useState("");
	const [position, setPosition] = useState("Delantero");

	// Archivo seleccionado por el usuario
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	// URL para mostrar la vista previa (preview) de la imagen
	const [previewSrc, setPreviewSrc] = useState("");

	const router = useRouter();

	useEffect(() => {
		if (selectedFile) {
			const objectUrl = URL.createObjectURL(selectedFile);
			setPreviewSrc(objectUrl);

			// Limpieza: revocar el Object URL cuando cambie el archivo o se desmonte el componente
			return () => URL.revokeObjectURL(objectUrl);
		} else {
			setPreviewSrc("");
		}
	}, [selectedFile]);

	/**
	 * Maneja el cambio de archivo en <input type="file" ... />
	 */
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
		}
	};

	/**
	 * Al enviar el formulario:
	 * 1. Subimos la foto a Cloudinary si hay un archivo seleccionado.
	 * 2. Obtenemos la URL de la imagen y la mandamos en la petición POST.
	 * 3. Redirigimos a /players si todo sale bien.
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			let profilePhotoUrl = "";

			if (selectedFile) {
				// Subimos la imagen a Cloudinary y obtenemos la URL final
				profilePhotoUrl = await uploadImageToCloudinary(selectedFile);
			}

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name,
						position,
						profilePhoto: profilePhotoUrl,
					}),
				}
			);

			if (!res.ok) {
				// Manejo de errores
				console.error("Error al crear el jugador");
				return;
			}

			router.push("/players");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="container mx-auto py-8">
			<Card className="max-w-md mx-auto shadow-md border border-gray-200">
				<CardHeader className="text-center bg-gray-50">
					<CardTitle className="text-xl font-semibold">Crear Jugador</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className="space-y-6">
						{/* NOMBRE */}
						<div>
							<Label htmlFor="name">Nombre del Jugador:</Label>
							<Input
								id="name"
								placeholder="Ingresa el nombre"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="mt-1"
							/>
						</div>

						{/* POSICION */}
						<div>
							<Label htmlFor="position">Posición:</Label>
							<select
								id="position"
								value={position}
								onChange={(e) => setPosition(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2">
								<option value="Delantero">Delantero</option>
								<option value="Defensa">Defensa</option>
								<option value="Centrocampista">Centrocampista</option>
								<option value="Portero">Portero</option>
								<option value="Lateral">Lateral</option>
							</select>
						</div>

						{/* FOTO DE PERFIL */}
						<div>
							<Label htmlFor="photo">Foto de perfil:</Label>
							<Input
								id="photo"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="mt-1"
							/>

							{/* VISTA PREVIA DE LA FOTO SELECCIONADA */}
							{previewSrc && (
								<div className="mt-4">
									<p className="text-sm text-gray-500">Vista previa:</p>
									<img
										src={previewSrc}
										alt="Vista previa"
										className="mt-2 h-48 w-48 object-cover rounded-md border border-gray-300"
									/>
								</div>
							)}
						</div>

						{/* BOTON DE CREAR */}
						<div className="flex justify-end">
							<Button
								type="submit"
								className="px-6 py-2">
								Crear
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
