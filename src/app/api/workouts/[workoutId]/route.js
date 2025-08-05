import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';
// IMPORTANT: Re-add firebaseAdmin and the secure token logic when you are ready.
// import { firebaseAdmin } from '@/lib/firebaseAdmin';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// GET: Fetches a single workout and its steps, with a security check.
export async function GET(req, { params }) {
  try {
    const { workoutId } = await params;
    if (!UUID_REGEX.test(workoutId)) {
      return NextResponse.json({ message: "Invalid workout ID format." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('firebaseUid');
    if (!firebaseUid) {
      return NextResponse.json({ message: 'Missing firebaseUid to fetch personalized stats.' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
    if (userError || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { data: workoutDetails, error: rpcError } = await supabase.rpc('get_workout_details_for_user', {
      p_workout_id: workoutId,
      p_user_id: user.id
    });

    if (rpcError) throw rpcError;

    if (!workoutDetails) {
      return NextResponse.json({ message: "Workout not found." }, { status: 404 });
    }

    if (!workoutDetails.is_public && workoutDetails.created_by_user_id !== user.id) {
      return NextResponse.json({ message: "Forbidden: You do not have permission to view this workout." }, { status: 403 });
    }

    return NextResponse.json(workoutDetails, { status: 200 });

  } catch (error) {
    console.error(`Error fetching workout:`, error);
    return NextResponse.json({ message: `Failed to fetch workout`, error: error.message }, { status: 500 });
  }
}

// PUT: Updates an existing workout.
export async function PUT(req, { params }) {
  const { workoutId } = await params;
  try {
    // We read the body once here and get all the data we need.
    const body = await req.json();
    const { name, description, is_public, steps, firebaseUid } = body;

    if (!firebaseUid || !name || !Array.isArray(steps)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
    if (userError || !user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const { data: updatedWorkout, error: rpcError } = await supabase.rpc('update_workout_with_steps', {
      p_workout_id: workoutId,
      p_user_id: user.id, // For security check inside the function
      p_name: name,
      p_description: description || null,
      p_is_public: is_public || false,
      p_steps: steps
    });

    // If the RPC function returns an error, throw it to the catch block.
    if (rpcError) throw rpcError;

    return NextResponse.json(updatedWorkout[0], { status: 200 });

  } catch (error) {
    console.error(`Error updating workout ${workoutId}:`, error);
    return NextResponse.json({ message: `Failed to update workout`, error: error.message }, { status: 500 });
  }
}

// DELETE: Deletes a workout, with a security check.
export async function DELETE(req, { params }) {
  const { workoutId } = await params;
  try {
    // For development, we get the UID from query params to check ownership.
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('firebaseUid');
    if (!firebaseUid) return NextResponse.json({ message: 'Missing firebaseUid' }, { status: 400 });

    const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
    if (userError || !user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // The .eq('created_by_user_id', user.id) is a CRITICAL security check.
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('created_by_user_id', user.id); // This ensures a user can ONLY delete their own workout.

    // If the delete operation fails, throw the error.
    if (error) throw error;

    return NextResponse.json({ message: "Workout deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting workout ${workoutId}:`, error);
    return NextResponse.json({ message: `Failed to delete workout`, error: error.message }, { status: 500 });
  }
}