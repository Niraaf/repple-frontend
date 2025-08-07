import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

export async function PATCH(req, { params }) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { sessionId } = await params;
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
        console.error(`Error finishing session:`, error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}