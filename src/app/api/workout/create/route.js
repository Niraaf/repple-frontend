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
        const { userId, name, exercises } = body;

        if (!userId || !name) {
            return new Response(JSON.stringify({ message: "Missing userId or name" }), { status: 400 });
        }

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

        return new Response(JSON.stringify({ workoutId: data.id }), { status: 200 });
    } catch (err) {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
