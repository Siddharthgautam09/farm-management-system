export default async function AnimalDetailsPage({
	params,
}: {
	params: Promise<{ animalId: string }>
}) {
	const { animalId } = await params
	return (
		<div>
			<h1 className="text-2xl font-semibold">Animal: {animalId}</h1>
			<p className="text-muted-foreground">Details coming soon.</p>
		</div>
	)
}

export function generateStaticParams(): Array<{ animalId: string }> {
	return []
}

export const dynamicParams = false

