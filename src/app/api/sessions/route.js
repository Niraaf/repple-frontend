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

        const { data: workoutPlan, error: workoutError } = await supabase
            .rpc('get_workout_details_for_user', {
                p_workout_id: workoutId,
                p_user_id: userProfile.id
            });

        if (workoutError) throw new Error("Workout plan not found.");

        const { data: newSession, error: insertError } = await supabase
            .from('sessions')
            .insert({
                user_id: user.id,
                workout_id: workoutId,
                started_at: new Date().toISOString(),
                workout_plan_snapshot: workoutPlan
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