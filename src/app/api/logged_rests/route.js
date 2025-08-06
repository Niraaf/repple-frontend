import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';

export async function POST(req) {
    try {
        // Dev-only auth pattern
        const body = await req.json();
        const { firebaseUid, session_id, target_duration_seconds, actual_duration_seconds } = body;

        if (!firebaseUid || !session_id) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('firebase_uid', firebaseUid)
            .single();

        if (userError || !user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // CRITICAL SECURITY CHECK: Verify the user owns the session they're logging to.
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('user_id')
            .eq('id', session_id)
            .single();

        if (sessionError || sessionData.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden: You do not have permission to log to this session.' }, { status: 403 });
        }

        // All checks passed, insert the new rest log.
        const { data: newLoggedRest, error: insertError } = await supabase
            .from('logged_rests')
            .insert({
                session_id,
                user_id: user.id, // Use the secure, internal user ID
                target_duration_seconds,
                actual_duration_seconds,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json(newLoggedRest, { status: 201 });

    } catch (err) {
        console.error("Server error logging rest:", err);
        return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}