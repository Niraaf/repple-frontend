import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin';
import { getAuthenticatedUser } from '@/lib/authHelper';

export async function PUT(req) {
    const { userProfile, error: authError } = await getAuthenticatedUser(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { username, unit_preference } = body;

        const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update({ username, unit_preference })
            .eq('id', userProfile.id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json(updatedProfile, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Failed to update profile", error: error.message }, { status: 500 });
    }
}