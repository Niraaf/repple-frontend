import { supabase } from "@/supabase/supabase";

export async function GET(req, context) {
    const params = await context.params;
    const { workoutId } = params;

    try {
        // 1️⃣ Fetch workout name
        const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .select('name')
            .eq('id', workoutId)
            .single();

        if (workoutError) {
            console.error("Error fetching workout name:", workoutError);
            return new Response(JSON.stringify({ message: "Workout not found" }), { status: 404 });
        }

        // 2️⃣ Fetch exercises with joins
        const { data: exercisesData, error: exercisesError } = await supabase
            .from('workout_exercises')
            .select(`
                id,
                workout_id,
                name,
                sets,
                reps,
                rest_seconds_planned,
                sequence,
                exercise_definition_id,
                exercise_definitions (
                    is_custom,
                    muscle_groups ( name ),
                    exercise_types ( name ),
                    focus_categories ( name ),
                    equipment ( name )
                )
            `)
            .eq('workout_id', workoutId)
            .order('sequence', { ascending: true });

        if (exercisesError) {
            console.error("Error fetching exercises:", exercisesError);
            return new Response(JSON.stringify({ message: "Failed to fetch exercises" }), { status: 500 });
        }

        // 3️⃣ Flatten the exercises
        const formattedExercises = (exercisesData || []).map(ex => ({
            id: ex.id,
            workout_id: ex.workout_id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds_planned: ex.rest_seconds_planned,
            sequence: ex.sequence,
            exercise_definition_id: ex.exercise_definition_id,
            muscle_group: ex.exercise_definitions.muscle_groups.name,
            type: ex.exercise_definitions.exercise_types.name,
            focus: ex.exercise_definitions.focus_categories.name,
            equipment: ex.exercise_definitions.equipment.name,
            is_custom: ex.exercise_definitions.is_custom
        }));

        // 4️⃣ Return combined response
        return new Response(JSON.stringify({
            workoutName: workoutData.name,
            exercises: formattedExercises
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
