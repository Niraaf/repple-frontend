import { createSupabaseServerClient } from '@/supabase/supabaseServer';
import { NextResponse } from 'next/server';

/**
 * A secure, server-side helper to get the authenticated Supabase user and their profile.
 * It now prioritizes the Authorization header for maximum reliability.
 */
export async function getAuthenticatedUser(req) {
    const supabase = await createSupabaseServerClient();
    try {
        const authHeader = req.headers.get('authorization');

        // Check for the Bearer token in the header first.
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // If no token, maybe it's a cookie-based session (for Server Components)
            // so we proceed and let supabase.auth.getUser() try to find it.
        }

        const idToken = authHeader ? authHeader.split('Bearer ')[1] : null;

        // THE FIX:
        // If we have a token, we use it to get the user.
        // If not, getUser() will try to use the cookie.
        const { data: { user }, error: authError } = await supabase.auth.getUser(idToken);

        if (authError || !user) {
            return { user: null, userProfile: null, error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
        }

        // Now that we have the user, fetch their profile from our public.users table.
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            // This case can happen if a user is created in auth but the DB trigger fails.
            // We can treat it as a server error or a "profile not found" error.
            console.error("User exists in auth, but not in public.users table:", profileError);
            return { user: null, userProfile: null, error: NextResponse.json({ message: 'User profile not found' }, { status: 404 }) };
        }

        return { user, userProfile, error: null };

    } catch (error) {
        return { user: null, userProfile: null, error: NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 }) };
    }
}