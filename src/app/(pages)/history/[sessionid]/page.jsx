import SessionSummary from "@/components/SessionHistory/SessionSummary";
import { createSupabaseServerClient } from "@/supabase/supabaseServer";
import { notFound } from "next/navigation";

// This server-side function now calls our powerful summary function.
async function getSessionDetails(sessionId) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) notFound();

    // THE FIX:
    // Call the RPC function to get the session with all calculated stats.
    const { data: sessionData, error } = await supabase
        .rpc('get_session_summary_details', {
            p_session_id: sessionId,
            p_user_id: user.id
        });

    // Security is handled inside the function, but this is a good safety check.
    if (error || !sessionData) notFound();

    return sessionData;
}

// This Server Component part is now correct.
export default async function SessionSummaryPage({ params }) {
    const { sessionId } = await params;
    const sessionData = await getSessionDetails(sessionId);

    return <SessionSummary sessionData={sessionData} />;
}