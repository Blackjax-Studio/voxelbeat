"use client";

interface DangerZoneTabProps {
  deleteAccountConfirm: {
    isOpen: boolean;
    step: number;
    inputValue: string;
  };
  setDeleteAccountConfirm: (config: any) => void;
  handleDeleteAccount: () => Promise<void>;
  isDeleting: boolean;
}

export default function DangerZoneTab({
  deleteAccountConfirm,
  setDeleteAccountConfirm,
  handleDeleteAccount,
  isDeleting
}: DangerZoneTabProps) {
  return (
    <div className="space-y-5">
      <div className="bg-rose-500/5 rounded-xl p-5 border border-rose-500/20">
        <h2 className="text-xl font-['Anton'] text-rose-500 mb-4">Danger Zone</h2>
        <p className="text-white/60 text-sm mb-6">
          These actions are permanent and cannot be undone. Please be certain before proceeding.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <h3 className="text-white font-medium mb-1">Delete Account</h3>
            <p className="text-white/50 text-xs mb-4">
              Once you delete your account, all your tracks, profile information, and data will be permanently removed.
            </p>
            <button
              onClick={() => setDeleteAccountConfirm({ ...deleteAccountConfirm, isOpen: true, step: 1 })}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal - Simplified inline version or just use state to show it */}
      {deleteAccountConfirm.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {deleteAccountConfirm.step === 1 ? (
              <>
                <h3 className="text-xl font-['Anton'] text-white mb-2">Are you absolutely sure?</h3>
                <p className="text-white/60 text-sm mb-6">
                  This action will permanently delete your account and all associated data. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteAccountConfirm({ ...deleteAccountConfirm, isOpen: false })}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteAccountConfirm({ ...deleteAccountConfirm, step: 2 })}
                    className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-['Anton'] text-white mb-2">Final Confirmation</h3>
                <p className="text-white/60 text-sm mb-4">
                  Please type <span className="text-white font-mono font-bold">DELETE</span> to confirm account deletion.
                </p>
                <input
                  type="text"
                  value={deleteAccountConfirm.inputValue}
                  onChange={(e) => setDeleteAccountConfirm({ ...deleteAccountConfirm, inputValue: e.target.value })}
                  placeholder="DELETE"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteAccountConfirm({ ...deleteAccountConfirm, isOpen: false, step: 1, inputValue: '' })}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountConfirm.inputValue !== 'DELETE' || isDeleting}
                    className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Delete Permanently
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
