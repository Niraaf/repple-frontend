import WorkoutBuilder from "@/components/WorkoutBuilder/WorkoutBuilder";

export default async function Workout({ params }) {
    const { workoutId } = await params;

    return (
        <div>
            <WorkoutBuilder workoutId={workoutId} />
        </div>
    )
}