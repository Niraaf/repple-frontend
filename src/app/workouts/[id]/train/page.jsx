import WorkoutTimer from "@/components/WorkoutTimer/WorkoutTimer"

export default async function PlayWorkout({ params }) {
    const { id } = await params;

    return (
        <div>
            <WorkoutTimer workoutId={id} />
        </div>
    )
}