import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req, { params }) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { sessionId } = await params;
        if (!UUID_REGEX.test(sessionId)) {
            return NextResponse.json({ message: "Invalid session ID format." }, { status: 400 });
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

export async function DELETE(req, { params }) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { sessionId } = await params;
        if (!UUID_REGEX.test(sessionId)) {
            return NextResponse.json({ message: "Invalid session ID format." }, { status: 400 });
        }

        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', user.id);

        if (error) throw error;
        return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting session:`, error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}