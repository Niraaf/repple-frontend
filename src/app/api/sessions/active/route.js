import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

export async function GET(req) {
    const { userProfile, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const { data: activeSession, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userProfile.id)
            .is('ended_at', null)
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!activeSession) {
            return NextResponse.json(null, { status: 200 });
        }

        const { data: lastAction } = await supabase.rpc('get_last_session_action_timestamp', {
            p_session_id: activeSession.id
        });

        const response = {
            ...activeSession,
            last_action_at: lastAction || activeSession.started_at
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Error fetching active session:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}