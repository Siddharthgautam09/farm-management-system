export default async function FatteningRoomPage({
	params,
}: {
	params: Promise<{ roomId: string }>
}) {
	const { roomId } = await params
	return (
		<div>
			<h1 className="text-2xl font-semibold">Fattening Room: {roomId}</h1>
			<p className="text-muted-foreground">Room details coming soon.</p>
		</div>
	)
}

export function generateStaticParams(): Array<{ roomId: string }> {
	// No pre-rendered rooms for static export by default.
	return []
}

export const dynamicParams = false

