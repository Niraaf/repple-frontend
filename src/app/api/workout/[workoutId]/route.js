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

export async function GET(req, context) {
  const { workoutId } = await context.params;

  if (!workoutId) {
    return new Response(JSON.stringify({ message: "Workout ID missing" }), { status: 400 });
  }

  try {
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .single();

    if (workoutError) {
      return new Response(JSON.stringify({ message: "Workout not found" }), { status: 404 });
    }

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select(`
        *,
        exercise_definitions (
          is_custom,
          exercise_types ( name ),
          focus_categories ( name ),
          equipment ( name ),
          exercise_muscle_groups (
            muscle_groups ( name )
          )
        )
      `)
      .eq("workout_id", workoutId)
      .order("sequence", { ascending: true });

    if (exercisesError) {
      return new Response(JSON.stringify({ message: "Failed to fetch exercises" }), { status: 500 });
    }

    const formattedExercises = (exercisesData || []).map((ex) => ({
      id: ex.id,
      workout_id: ex.workout_id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      sequence: ex.sequence,
      exercise_definition_id: ex.exercise_definition_id,
      rest_between_exercise: ex.rest_between_exercise,
      rest_between_sets: ex.rest_between_sets,
      muscle_groups: ex.exercise_definitions.exercise_muscle_groups
        .map((mg) => mg.muscle_groups.name)
        .sort(),
      type: ex.exercise_definitions.exercise_types.name,
      focus: ex.exercise_definitions.focus_categories.name,
      equipment: ex.exercise_definitions.equipment.name,
      is_custom: ex.exercise_definitions.is_custom,
    }));

    return new Response(
      JSON.stringify({
        workout_name: workoutData.name,
        num_exercises: workoutData.num_exercises,
        estimated_duration: workoutData.estimated_duration,
        last_performed: workoutData.last_performed,
        exercises: formattedExercises,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

export async function PUT(req, context) {
  const { workoutId } = await context.params;

  if (!workoutId) {
    return new Response(JSON.stringify({ message: "Workout ID missing" }), { status: 400 });
  }

  try {
    const body = await req.json();
    const { exercises, workoutName } = body;

    if (!Array.isArray(exercises)) {
      return new Response(JSON.stringify({ message: "Invalid exercises format" }), { status: 400 });
    }

    const { error: nameError } = await supabase
      .from("workouts")
      .update({
        name: workoutName,
        num_exercises: exercises.length,
        estimated_duration: calculateEstimatedDuration(exercises),
      })
      .eq("id", workoutId);

    if (nameError) {
      return new Response(JSON.stringify({ message: "Failed to update workout name" }), { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", workoutId);

    if (deleteError) {
      return new Response(JSON.stringify({ message: "Failed to reset exercises" }), { status: 500 });
    }

    if (exercises.length === 0) {
      return new Response(JSON.stringify({ message: "Workout saved (no exercises)" }), { status: 200 });
    }

    const insertData = exercises.map((ex, idx) => ({
      workout_id: workoutId,
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
      return new Response(JSON.stringify({ message: "Failed to save exercises" }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Workout saved successfully!" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

export async function DELETE(req, context) {
  const { workoutId } = await context.params;

  if (!workoutId) {
    return new Response(JSON.stringify({ message: "Workout ID missing" }), { status: 400 });
  }

  try {
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId);

    if (error) {
      return new Response(JSON.stringify({ message: "Failed to delete workout" }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Workout deleted successfully" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
