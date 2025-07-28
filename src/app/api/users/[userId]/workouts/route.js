import { supabase } from "@/supabase/supabase";

export async function GET(req, context) {
    const { userId } = await context.params;

    if (!userId) {
        return new Response(JSON.stringify({ message: 'Missing userId' }), { status: 400 });
    }

    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching workouts:", error);
        return new Response(JSON.stringify([]), { status: 500 });
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
