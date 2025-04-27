import WorkoutBuilder from "@/components/WorkoutBuilder/WorkoutBuilder";

export default async function Workout({params}) {
    const { id } = await params;

    return (
        <div>
            <WorkoutBuilder workoutId={id}/>
        </div>
    )
}