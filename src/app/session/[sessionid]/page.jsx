import LiveSessionPlayer from "@/components/LiveSessionPlayer/LiveSessionPlayer"

export default async function PlayWorkout({ params }) {
    const { sessionId } = await params;

    return (
        <div>
            <LiveSessionPlayer sessionId={sessionId} />
        </div>
    )
}