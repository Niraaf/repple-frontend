import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';

/**
 * POST: Creates a new record for a single completed set.
 */
export async function POST(req) {
    try {
        // Dev-only auth
        const body = await req.json();
        const { firebaseUid, session_id, exercise_id, set_number, weight_kg, reps_completed, duration_seconds, notes } = body;

        if (!firebaseUid || !session_id || !exercise_id) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
        if (userError || !user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // CRITICAL SECURITY CHECK: Verify the user owns the session they're logging to.
        const { data: sessionData, error: sessionError } = await supabase.from('sessions').select('user_id').eq('id', session_id).single();
        if (sessionError || sessionData.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden: You do not own this session.' }, { status: 403 });
        }

        // All checks passed, insert the new set log.
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