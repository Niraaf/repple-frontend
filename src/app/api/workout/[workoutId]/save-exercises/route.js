import { supabase } from "@/supabase/supabase";

function calculateEstimatedDuration(exercises) {
    let totalSeconds = 0;
    const avgSecondsPerRep = 4;

    exercises.forEach((ex, idx) => {
        const sets = ex.sets;
        const reps = ex.reps;
        const timePerSet = reps * avgSecondsPerRep + 10;

        totalSeconds += sets * timePerSet;
        totalSeconds += (sets - 1) * ex.rest_between_sets;

        if (idx < exercises.length - 1) {
            totalSeconds += ex.rest_between_exercise;
        }
    });

    return Math.ceil(totalSeconds / 60);
}

export async function POST(req, context) {
    const params = await context.params;
    const { workoutId } = params;

    try {
        const body = await req.json();
        const { exercises, workoutName } = body;

        if (!Array.isArray(exercises)) {
            return new Response(JSON.stringify({ message: "Invalid exercises format" }), { status: 400 });
        }

        const { error: nameError } = await supabase
            .from('workouts')
            .update({
                name: workoutName,
                num_exercises: exercises.length,
                estimated_duration: calculateEstimatedDuration(exercises)
                })
            .eq('id', workoutId);

        if (nameError) {
            console.error("Failed to update workout name:", nameError);
            return new Response(JSON.stringify({ message: "Failed to update workout name" }), { status: 500 });
        }

        // 1️⃣ Delete existing exercises
        const { error: deleteError } = await supabase
            .from('workout_exercises')
            .delete()
            .eq('workout_id', workoutId);

        if (deleteError) {
            console.error("Failed to clear old exercises:", deleteError);
            return new Response(JSON.stringify({ message: "Failed to reset exercises" }), { status: 500 });
        }

        if (exercises.length === 0) {
            return new Response(JSON.stringify({ message: "Workout saved (no exercises)" }), { status: 200 });
        }

        // 2️⃣ Prepare bulk insert
        const insertData = exercises.map((ex, idx) => ({
            workout_id: workoutId,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            sequence: idx,
            exercise_definition_id: ex.exercise_definition_id,
            rest_between_exercise: ex.rest_between_exercise,
            rest_between_sets: ex.rest_between_sets
        }));

        const { error: insertError } = await supabase
            .from('workout_exercises')
            .insert(insertData);

        if (insertError) {
            console.error("Error saving exercises:", insertError);
            return new Response(JSON.stringify({ message: "Failed to save exercises" }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: "Workout saved successfully!" }), { status: 200 });

    } catch (err) {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
