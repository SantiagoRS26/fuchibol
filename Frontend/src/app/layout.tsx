import "./globals.css";
import { Inter } from "next/font/google";
import { NavBar } from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Fuchibol App",
	description: "Aplicación de fútbol con Next.js",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body className={inter.className}>
				<NavBar />
				<main>{children}</main>
			</body>
		</html>
	);
}
