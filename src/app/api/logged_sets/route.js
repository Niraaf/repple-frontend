import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

/**
 * POST: Creates a new record for a single completed set.
 */
export async function POST(req) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { session_id, exercise_id, set_number, weight_kg, reps_completed, duration_seconds, notes } = body;

        if (!session_id || !exercise_id) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const { data: sessionData, error: sessionError } = await supabase.from('sessions').select('user_id').eq('id', session_id).single();
        if (sessionError || sessionData.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden: You do not own this session.' }, { status: 403 });
        }

        const { data: newLoggedSet, error: insertError } = await supabase
            .from('logged_sets')
            .insert({
                session_id,
                user_id: user.id,
                exercise_id,
                set_number,
                weight_kg,
                reps_completed,
                duration_seconds,
                notes,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json(newLoggedSet, { status: 201 });

    } catch (err) {
        console.error("Server error logging set:", err);
        return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}