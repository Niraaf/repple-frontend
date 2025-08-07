import { createSupabaseBrowserClient } from '@/supabase/supabaseClient';

const supabase = createSupabaseBrowserClient();

export const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated.");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
};