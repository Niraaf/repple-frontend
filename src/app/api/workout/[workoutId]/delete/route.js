import { supabase } from "@/supabase/supabase";

export async function DELETE(req, context) {
    const { workoutId } = context.params;

    if (!workoutId) {
        return new Response(JSON.stringify({ message: "Workout ID missing" }), { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);

        if (error) {
            console.error("Failed to delete workout:", error);
            return new Response(JSON.stringify({ message: "Failed to delete workout" }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: "Workout deleted successfully" }), { status: 200 });
    } catch (err) {
        console.error("Server error during workout delete:", err);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
}
