import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req, { params }) {
    const { userProfile, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { sessionId } = await params;
        if (!UUID_REGEX.test(sessionId)) {
            return NextResponse.json({ message: "Invalid session ID format." }, { status: 400 });
        }

        const { data: session, error } = await supabase
            .from('sessions')
            .select(`
                *,
                logged_sets (*),
                logged_rests (*)
            `)
            .eq('id', sessionId)
            .eq('user_id', userProfile.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ message: "Session not found." }, { status: 404 });
            throw error;
        }

        const responsePayload = {
            ...session,
            workout: session.workout_plan_snapshot
        };

        return NextResponse.json(responsePayload, { status: 200 });

    } catch (error) {
        console.error(`Error fetching session:`, error);
        return NextResponse.json({ message: `Failed to fetch session`, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { userProfile, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { sessionId } = await params;
        if (!UUID_REGEX.test(sessionId)) {
            return NextResponse.json({ message: "Invalid session ID format." }, { status: 400 });
        }

        const { error: deleteError } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', userProfile.id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ message: "Session deleted successfully." }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting session:`, error);
        return NextResponse.json({ message: `Failed to delete session`, error: error.message }, { status: 500 });
    }
}