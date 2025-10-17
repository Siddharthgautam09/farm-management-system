import type { ReactNode } from "react"

export default function ReportsLayout({ children }: { children: ReactNode }) {
	return (
		<section className="space-y-4">
			{children}
		</section>
	)
}

