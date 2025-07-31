import { supabase } from "@/supabase/supabase";

function calculateEstimatedDuration(exercises) {
    let totalSeconds = 0;
    const avgSecondsPerRep = 4;

    exercises.forEach((ex, idx) => {
        const sets = ex.sets;
        const reps = ex.reps;
        const timePerSet = reps * avgSecondsPerRep;

        totalSeconds += sets * timePerSet;
        totalSeconds += (sets - 1) * ex.rest_between_sets;

        if (idx < exercises.length - 1) {
            totalSeconds += ex.rest_between_exercise;
        }
    });

    return Math.ceil(totalSeconds / 60);
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { userId, workoutName, exercises } = body;

        if (!userId || !workoutName) {
            return new Response(JSON.stringify({ message: "Missing userId or name" }), { status: 400 });
        }

        const name = workoutName;
        const { data, error } = await supabase
            .from('workouts')
            .insert([{
                user_id: userId,
                name,
                num_exercises: Array.isArray(exercises) ? exercises.length : 0,
                estimated_duration: Array.isArray(exercises) ? calculateEstimatedDuration(exercises) : 0
            }])
            .select('id')
            .single();

        if (error) {
            console.error("Error creating workout:", error);
            return new Response(JSON.stringify({ message: "Failed to create workout" }), { status: 500 });
        }

        if (Array.isArray(exercises) && exercises.length > 0) {
            const insertData = exercises.map((ex, idx) => ({
                workout_id: data.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                sequence: idx,
                exercise_definition_id: ex.exercise_definition_id,
                rest_between_exercise: ex.rest_between_exercise,
                rest_between_sets: ex.rest_between_sets,
            }));

            const { error: insertError } = await supabase.from("workout_exercises").insert(insertData);

            if (insertError) {
                console.error("Error inserting exercises:", insertError);
                return new Response(JSON.stringify({ message: "Workout created, but failed to save exercises" }), { status: 500 });
            }
        }

        return new Response(JSON.stringify({ workoutId: data.id, message: "Workout created successfully!" }), { status: 200 });
    } catch (err) {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}