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

	// Imagen actual del jugador (guardada en la DB)
	const [profilePhoto, setProfilePhoto] = useState("");

	// Archivo que el usuario selecciona para cambiar la foto
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// URL para la vista previa (la foto actual o la nueva imagen seleccionada)
	const [previewSrc, setPreviewSrc] = useState("");

	useEffect(() => {
		// Al montar el componente, obtenemos la información del jugador
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

				// Si el jugador tiene una foto, la guardamos en el estado
				if (data.profilePhoto) {
					setProfilePhoto(data.profilePhoto);
				}

				setLoading(false);
			} catch (error) {
				console.error(error);
			}
		};

		if (id) {
			fetchPlayer();
		}
	}, [id]);

	/**
	 * Efecto para manejar la vista previa de la imagen.
	 * - Si el usuario selecciona un archivo nuevo, generamos un Object URL.
	 * - Si no hay archivo seleccionado, usamos la foto del jugador (si existe).
	 */
	useEffect(() => {
		if (selectedFile) {
			// Generamos un URL temporal para mostrar la imagen seleccionada
			const objectUrl = URL.createObjectURL(selectedFile);
			setPreviewSrc(objectUrl);

			// Limpiar el Object URL cuando se desmonte el componente o se cambie el archivo
			return () => URL.revokeObjectURL(objectUrl);
		} else {
			// Si no hay archivo seleccionado, mostramos la foto actual (si existe)
			setPreviewSrc(profilePhoto || "");
		}
	}, [selectedFile, profilePhoto]);

	// Maneja el cambio de archivo en el input <input type="file" ...>
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
		}
	};

	// Subida de la imagen a Cloudinary
	const uploadImageToCloudinary = async (file: File) => {
		const formData = new FormData();
		formData.append("file", file);
		// Reemplaza con tu upload preset creado en Cloudinary
		formData.append("upload_preset", "player_photos");

		// URL de tu cuenta en Cloudinary (cambia "dkvmoxegn" por tu "cloud_name")
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
	};

	// Maneja el envío del formulario
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			let uploadedImageUrl = profilePhoto;

			// Si se seleccionó un nuevo archivo, lo subimos a Cloudinary
			if (selectedFile) {
				uploadedImageUrl = await uploadImageToCloudinary(selectedFile);
			}

			// Hacemos el PUT al backend para actualizar el jugador con la nueva foto (o la anterior)
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/players/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name,
						position,
						profilePhoto: uploadedImageUrl,
					}),
				}
			);

			if (!res.ok) {
				console.error("Error al actualizar jugador");
				return;
			}

			// Regresamos a la lista de jugadores
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

						<div>
							<Label htmlFor="profilePhoto">Foto de perfil:</Label>
							<Input
								id="profilePhoto"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
							/>
						</div>

						{/* Mostramos la vista previa solo si existe previewSrc (foto actual o nueva) */}
						{previewSrc && (
							<div className="mt-3">
								<p className="text-sm text-gray-600 mb-2">Vista previa:</p>
								<img
									src={previewSrc}
									alt="Foto de perfil"
									className="h-full w-full object-cover rounded-md"
								/>
							</div>
						)}

						<Button type="submit">Guardar</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
