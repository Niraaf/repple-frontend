import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET: Fetches all data required to run a specific workout session.
 * This includes the session record, the full workout plan, and any previously logged sets.
 */
export async function GET(req, { params }) {
    try {
        const { sessionId } = await params;

        // 1. Validate the session ID format.
        if (!UUID_REGEX.test(sessionId)) {
            return NextResponse.json({ message: "Invalid session ID format." }, { status: 400 });
        }

        // 2. Get the current user's ID (Dev-only auth pattern).
        const { searchParams } = new URL(req.url);
        const firebaseUid = searchParams.get('firebaseUid');
        if (!firebaseUid) {
            return NextResponse.json({ message: 'Missing firebaseUid to fetch session details.' }, { status: 400 });
        }

        const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
        if (userError || !user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 3. Fetch the session and all its related data in one powerful query.
        const { data, error } = await supabase
            .from('sessions')
            .select(`
                *,
                workout:workouts (
                    *,
                    workout_steps (
                        *,
                        exercise:exercises (
                            *,
                            muscles:exercise_muscles(muscle:muscles(id, name)),
                            equipments:exercise_equipment(equipment:equipments(id, name)),
                            mechanics:exercise_mechanics(mechanic:mechanics(id, name))
                        )
                    )
                ),
                logged_sets ( * ),
                logged_rests ( * )
            `)
            .eq('id', sessionId)
            .order('sequence_order', { referencedTable: 'workouts.workout_steps', ascending: true })
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Row not found
                return NextResponse.json({ message: "Session not found." }, { status: 404 });
            }
            throw error;
        }

        // 4. CRITICAL SECURITY CHECK: Ensure the user owns this session.
        if (data.user_id !== user.id) {
            return NextResponse.json({ message: "Forbidden: You do not have permission to view this session." }, { status: 403 });
        }

        // 5. Data formatting
        const formattedSteps = (data.workout?.workout_steps || []).map(step => {
            if (step.step_type === 'REST' || !step.exercise) {
                return step;
            }
            // Flatten the nested tag structure for the exercise within the step.
            return {
                ...step,
                exercise: {
                    ...step.exercise,
                    muscles: step.exercise.muscles.map(m => m.muscle),
                    equipments: step.exercise.equipments.map(e => e.equipment),
                    mechanics: step.exercise.mechanics.map(m => m.mechanic),
                }
            };
        });

        const responsePayload = {
            ...data,
            workout: {
                ...data.workout,
                workout_steps: formattedSteps
            }
        };

        return NextResponse.json(responsePayload, { status: 200 });

    } catch (error) {
        console.error(`Error fetching session:`, error);
        return NextResponse.json({ message: `Failed to fetch session`, error: error.message }, { status: 500 });
    }
}