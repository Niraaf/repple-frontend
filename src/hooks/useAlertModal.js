import React, { useState, useCallback } from 'react';
import AlertModal from '@/components/AlertModal/AlertModal';

export const useAlertModal = () => {
    const [modalState, setModalState] = useState(null);

    const showAlert = useCallback((options) => {
        return new Promise((resolve) => {
            setModalState({ ...options, resolve });
        });
    }, []);

    const handleClose = () => {
        modalState?.resolve(true); // Always resolves true when closed
        setModalState(null);
    };

    const AlertModalComponent = modalState ? (
        <AlertModal
            isOpen={!!modalState}
            onClose={handleClose}
            {...modalState}
        />
    ) : null;

    return { showAlert, AlertModalComponent };
};