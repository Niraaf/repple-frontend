import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req, { params }) {
  const { user, error: authError } = await getAuthenticatedUser(req);
  if (authError) return authError;

  try {
    const { workoutId } = await params;
    if (!UUID_REGEX.test(workoutId)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }
    console.log(`Fetching workout details for ID: ${workoutId} by user: ${user.id}`);

    const { data, error } = await supabase.rpc('get_workout_details_for_user', {
      p_workout_id: workoutId,
      p_user_id: user.id
    });

    if (error) throw error;
    if (!data) return NextResponse.json({ message: "Workout not found" }, { status: 404 });

    if (!data.is_public && data.created_by_user_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch workout", error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
    const { userProfile, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { workoutId } = await params;
        const { name, description, is_public, steps } = await req.json();

        const { data: updatedWorkout, error: rpcError } = await supabase.rpc('update_workout_with_steps', {
            p_workout_id: workoutId,
            p_user_id: userProfile.id,
            p_name: name,
            p_description: description || null,
            p_is_public: is_public || false,
            p_steps: steps
        });

        if (rpcError) throw rpcError;
        
        return NextResponse.json(updatedWorkout, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Failed to update workout", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
  const { user, error: authError } = await getAuthenticatedUser(req);
  if (authError) return authError;

  try {
    const { workoutId } = await params;
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('created_by_user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ message: "Workout deleted successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to delete workout", error: error.message }, { status: 500 });
  }
}