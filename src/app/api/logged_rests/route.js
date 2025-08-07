import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

export async function POST(req) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { session_id, target_duration_seconds, actual_duration_seconds } = body;

        if (!session_id) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const { data: sessionData, error: sessionError } = await supabase.from('sessions').select('user_id').eq('id', session_id).single();
        if (sessionError || sessionData.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { data: newLoggedRest, error: insertError } = await supabase
            .from('logged_rests')
            .insert({
                session_id,
                user_id: user.id,
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