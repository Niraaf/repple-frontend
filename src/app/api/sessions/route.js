import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

export async function POST(req) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { workoutId } = body;

        if (!workoutId) {
            return NextResponse.json({ message: "Missing workoutId" }, { status: 400 });
        }

        const { data: newSession, error: insertError } = await supabase
            .from('sessions')
            .insert({
                user_id: user.id,
                workout_id: workoutId,
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError) throw insertError;
        return NextResponse.json(newSession, { status: 201 });

    } catch (err) {
        console.error("Server error creating session:", err);
        return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}