import { supabase } from "@/supabase/supabase";

export async function POST(req) {
    try {
        const body = req.json();
        const { userId, name } = body;

        if (!userId || !name) {
            return new Response(JSON.stringify({ message: "Missing userId or name" }), { status: 400 });
        }

        const { data, error } = await supabase
            .from('workouts')
            .insert([{ user_id: userId, name }])
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