import React, { useState, useCallback } from 'react';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';

export const useConfirmationModal = () => {
    const [modalState, setModalState] = useState(null);

    const showConfirmation = useCallback((options) => {
        return new Promise((resolve) => {
            setModalState({ ...options, resolve });
        });
    }, []);

    const handleConfirm = () => {
        modalState?.resolve(true);
        setModalState(null);
    };

    const handleCancel = () => {
        modalState?.resolve(false);
        setModalState(null);
    };

    const ConfirmationModalComponent = modalState ? (
        <ConfirmationModal
            isOpen={!!modalState}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            {...modalState}
        />
    ) : null;

    return { showConfirmation, ConfirmationModalComponent };
};