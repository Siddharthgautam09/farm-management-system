export default async function ReceivingRoomPage({
	params,
}: {
	params: Promise<{ roomTd: string }>
}) {
	const { roomTd } = await params
	return (
		<div>
			<h1 className="text-2xl font-semibold">Receiving Room: {roomTd}</h1>
			<p className="text-muted-foreground">Room details coming soon.</p>
		</div>
	)
}

export function generateStaticParams(): Array<{ roomTd: string }> {
	return []
}

export const dynamicParams = false

