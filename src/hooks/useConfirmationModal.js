import React, { useState, useCallback } from 'react';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';

export const useConfirmationModal = () => {
    const [modalState, setModalState] = useState(null);

    const showConfirmation = useCallback((options) => {
        return new Promise((resolve) => {
            setModalState({ ...options, resolve });
        });
    }, []);

    const handleAction = (result) => {
        modalState?.resolve(result);
        setModalState(null);
    };

    const handleClose = (result) => {
        modalState?.resolve(result);
        setModalState(null);
    };

    const buttons = modalState?.buttons || [
        {
            text: modalState?.cancelText || "Cancel",
            onClick: () => handleAction(false),
            variant: 'secondary'
        },
        {
            text: modalState?.confirmText || "Confirm",
            onClick: () => handleAction(true),
            variant: modalState?.confirmVariant || 'default'
        }
    ];

    const ConfirmationModalComponent = modalState ? (
        <ConfirmationModal
            isOpen={!!modalState}
            onClose={() => handleClose(false)} 
            title={modalState.title}
            description={modalState.description}
            buttons={buttons}
        />
    ) : null;

    return { showConfirmation, ConfirmationModalComponent, handleClose };
};