"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function NavBar() {
	const [isOpen, setIsOpen] = useState(false);

	const navigation = [
		{ name: "Inicio", href: "/" },
		{ name: "Jugadores", href: "/players" },
		{ name: "Partidos", href: "/matches" },
		{ name: "Estadisticas", href: "/stats" },
		{ name: "Mapa", href: "/map" },
	];

	const handleToggle = () => {
		setIsOpen((prev) => !prev);
	};

	return (
		<nav className="border-b bg-white">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				<div className="text-xl font-bold">
					<Link href="/">Fuchibol</Link>
				</div>

				<div className="md:hidden">
					<Button
						variant="ghost"
						onClick={handleToggle}
						aria-label="Toggle Menu">
						{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>

				<div className="hidden md:flex space-x-4">
					{navigation.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className="font-medium hover:text-blue-600">
							{item.name}
						</Link>
					))}
				</div>
			</div>

			{isOpen && (
				<div className="md:hidden px-4 pb-3">
					<ul className="flex flex-col space-y-2">
						{navigation.map((item) => (
							<li key={item.name}>
								<Link
									href={item.href}
									className="block w-full py-1 font-medium hover:text-blue-600"
									onClick={() => setIsOpen(false)}>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</nav>
	);
}
