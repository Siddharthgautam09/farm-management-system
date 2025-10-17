export default async function WeaningRoomPage({
	params,
}: {
	params: Promise<{ roomId: string }>
}) {
	const { roomId } = await params
	return (
		<div>
			<h1 className="text-2xl font-semibold">Weaning Room: {roomId}</h1>
			<p className="text-muted-foreground">Room details coming soon.</p>
		</div>
	)
}

export function generateStaticParams(): Array<{ roomId: string }> {
	return []
}

export const dynamicParams = false

