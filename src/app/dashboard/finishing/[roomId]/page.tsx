export default async function FinishingRoomPage({
	params,
}: {
	params: Promise<{ roomId: string }>
}) {
	const { roomId } = await params
	return (
		<div>
			<h1 className="text-2xl font-semibold">Finishing Room: {roomId}</h1>
			<p className="text-muted-foreground">Room details coming soon.</p>
		</div>
	)
}

export function generateStaticParams(): Array<{ roomId: string }> {
	return []
}

export const dynamicParams = false

