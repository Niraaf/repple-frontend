'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useActiveSession, useDeleteSession, useFinishSession } from '@/hooks/useSession';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';
import { useRouter } from 'nextjs-toploader/app'
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';


export default function SessionManager() {
    const router = useRouter();
    const pathname = usePathname();
    const { userLoading } = useAuth();
    const { showConfirmation, ConfirmationModalComponent, handleClose } = useConfirmationModal();

    // Fetching and mutation hooks
    const { data: activeSession, isSuccess } = useActiveSession();
    const { mutate: deleteSession } = useDeleteSession();
    const { mutate: finishSession } = useFinishSession();

    const hasShownPrompt = useRef(false);

    useEffect(() => {
        if (!userLoading && isSuccess && activeSession && !hasShownPrompt.current) {
            hasShownPrompt.current = true;

            const timeSinceLastAction = (Date.now() - new Date(activeSession.last_action_at).getTime());
            const minutesSince = Math.round(timeSinceLastAction / 1000 / 60);
            const hoursSince = Math.round(minutesSince / 60);
            const STALE_THRESHOLD_MINUTES = 0;

            const resumeAction = () => {
                router.push(`/session/${activeSession.id}`);
                handleClose(true);
            };

            const discardAction = () => {
                deleteSession(activeSession.id, {
                    onSuccess: () => {
                        toast.success("Session discarded.");
                        if (pathname === `/session/${activeSession.id}`) {
                            router.replace('/workouts');
                        }
                    }
                });
                handleClose(false);
            };

            const finalizeAction = () => {
                finishSession(activeSession.id);
                toast.success("Previous session saved!");
                handleClose(false);
            };

            if (minutesSince > STALE_THRESHOLD_MINUTES) {
                const timeAgo = minutesSince < 60
                    ? `${minutesSince} minutes ago`
                    : hoursSince < 24
                        ? `${hoursSince} hours ago`
                        : `${Math.round(hoursSince / 24)} days ago`;
                showConfirmation({
                    title: "Resume Stale Workout?",
                    description: `You have an unfinished workout from ${timeAgo}. What would you like to do?`,
                    buttons: [
                        { text: "Discard", onClick: discardAction, variant: 'destructive' },
                        { text: "Finalize & Save", onClick: finalizeAction, variant: 'positive' },
                        { text: "Resume", onClick: resumeAction, variant: 'default' }
                    ]
                });
            } else {
                showConfirmation({
                    title: "Resume Workout?",
                    description: "You have an unfinished workout in progress.",
                    buttons: [
                        { text: "Discard", onClick: discardAction, variant: 'destructive' },
                        { text: "Resume", onClick: resumeAction, variant: 'positive' }
                    ]
                });
            }
        }
    }, [userLoading, isSuccess, activeSession, showConfirmation, router, deleteSession, finishSession, handleClose]);

    return ConfirmationModalComponent;
}