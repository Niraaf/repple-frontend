import SessionHistoryList from "@/components/SessionHistory/SessionHistoryList";
import { createSupabaseServerClient } from "@/supabase/supabaseServer";

async function getInitialSessions() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: sessions, error } = await supabase
        .rpc('get_user_session_history', { p_user_id: user.id });

    if (error) {
        console.error('Error fetching user session history:', error);
        return [];
    }

    return sessions || [];
}

export default async function HistoryPage() {
    const initialSessions = await getInitialSessions();
    
    return <SessionHistoryList initialSessions={initialSessions} />;
}