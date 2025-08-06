import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';

/**
 * PATCH: Finalizes a workout session by setting its 'ended_at' timestamp.
 */
export async function PATCH(req, { params }) {
    const { sessionId } = await params;
    try {
        const body = await req.json();
        const { firebaseUid } = body;

        if (!firebaseUid) {
            return NextResponse.json({ message: "Missing firebaseUid" }, { status: 400 });
        }

        const { data: user, error: userError } = await supabase.from('users').select('id').eq('firebase_uid', firebaseUid).single();
        if (userError || !user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // Update the session, but only if it belongs to the user and is not already finished.
        const { data: updatedSession, error } = await supabase
            .from('sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .is('ended_at', null)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(updatedSession, { status: 200 });

    } catch (error) {
        console.error(`Error finishing session ${sessionId}:`, error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}