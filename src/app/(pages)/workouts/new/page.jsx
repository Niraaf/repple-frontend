import WorkoutBuilder from "@/components/WorkoutBuilder/WorkoutBuilder"

export default async function CreateWorkout() {
    return (
        <div>
            <WorkoutBuilder workoutId={"new"} initialData={null} />
        </div>
    )
}