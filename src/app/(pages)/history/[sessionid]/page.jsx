import SessionSummary from "@/components/SessionHistory/SessionSummary";
import { createSupabaseServerClient } from "@/supabase/supabaseServer";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getSessionDetails(sessionId) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) notFound();

    const { data: sessionData, error } = await supabase
        .rpc('get_session_summary_details', {
            p_session_id: sessionId,
            p_user_id: user.id
        });

    if (error || !sessionData) notFound();

    return sessionData;
}

export default async function SessionSummaryPage({ params }) {
    const { sessionId } = await params;
    const sessionData = await getSessionDetails(sessionId);

    return <SessionSummary sessionData={sessionData} />;
}