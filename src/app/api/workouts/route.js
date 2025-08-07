import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

/**
 * GET: Fetches all workouts with calculated stats for the authenticated user.
 */
export async function GET(req) {
    const { userProfile, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { data: workouts, error: rpcError } = await supabase
            .rpc('get_user_workouts_with_stats', { p_user_id: userProfile.id });

        if (rpcError) throw rpcError;
        return NextResponse.json(workouts, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

/**
 * POST: Creates a new workout for the authenticated user.
 */
export async function POST(req) {
    const { userProfile, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { name, description, is_public, steps } = body;

        if (!name || !Array.isArray(steps)) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const { data: newWorkout, error: rpcError } = await supabase.rpc('create_workout_with_steps', {
            p_user_id: userProfile.id, // Use the secure ID
            p_name: name,
            p_description: description || null,
            p_is_public: is_public || false,
            p_steps: steps
        });

        if (rpcError) throw rpcError;
        return NextResponse.json(newWorkout[0], { status: 201 });

    } catch (err) {
        return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}