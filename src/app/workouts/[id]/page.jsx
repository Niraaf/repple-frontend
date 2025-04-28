import WorkoutView from "@/components/WorkoutView/WorkoutView";

export default async function Workout({params}) {
    const { id } = await params;

    return (
        <div>
            <WorkoutView workoutId={id}/>
        </div>
    )
}