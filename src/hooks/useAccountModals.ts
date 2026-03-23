import { useState } from "react";

export function useAccountModals() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const [deleteTrackConfirm, setDeleteTrackConfirm] = useState<{
    isOpen: boolean;
    trackId: string | null;
    trackTitle: string
  }>({
    isOpen: false,
    trackId: null,
    trackTitle: ''
  });

  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState({
    isOpen: false,
    step: 1,
    inputValue: ''
  });

  return {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingTrack,
    setEditingTrack,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isSignupModalOpen,
    setIsSignupModalOpen,
    deleteTrackConfirm,
    setDeleteTrackConfirm,
    deleteAccountConfirm,
    setDeleteAccountConfirm
  };
}
