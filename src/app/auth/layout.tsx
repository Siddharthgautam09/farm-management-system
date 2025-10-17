import type { ReactNode } from "react"

export default function AuthLayout({
	children,
}: {
	children: ReactNode
}) {
	return (
		<section className="min-h-screen flex items-center justify-center bg-gray-50">
			{children}
		</section>
	)
}

