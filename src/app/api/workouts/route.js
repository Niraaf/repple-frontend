import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';

// GET: Fetches all workouts for a user (INSECURE DEV VERSION)
export async function GET(req) {
    try {
        // Using the insecure dev version for now
        const { searchParams } = new URL(req.url);
        const firebaseUid = searchParams.get('firebaseUid');
        if (!firebaseUid) {
            return NextResponse.json({ message: 'Missing firebaseUid' }, { status: 400 });
        }

        const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
        if (userError || !user) throw new Error('User not found');

        // Call the RPC function to get workouts with calculated stats
        const { data: workouts, error: rpcError } = await supabase
            .rpc('get_user_workouts_with_stats', { p_user_id: user.id });

        if (rpcError) throw rpcError;

        return NextResponse.json(workouts, { status: 200 });

    } catch (error) {
        console.error("Error fetching workouts:", error.message);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// POST: Creates a new workout (INSECURE DEV VERSION)
export async function POST(req) {
    try {
        const body = await req.json();
        const { name, description, is_public, steps, firebaseUid } = body;

        if (!firebaseUid || !name || !Array.isArray(steps)) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
        if (userError || !user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const { data: newWorkout, error: rpcError } = await supabase.rpc('create_workout_with_steps', {
            p_user_id: user.id,
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