import { useAuth } from "../../../stores/authStore";
import { isLtd, isUserActiveTeamMember, isUserFreePlan, isUserTeamAdmin } from "../../../lib/payment-helper";
import { Loader, Modal } from "@mantine/core";

type DeleteUserModalProps = {
  opened: boolean;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
};

export default function DeleteUserModal({
  opened,
  onConfirm,
  onClose,
  loading,
}: DeleteUserModalProps) {
  const { ventoUser } = useAuth();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="auto"
      withCloseButton={false}
      closeOnClickOutside={!loading}
      classNames={{
        root: "vento-modal",
      }}
    >
      {(isUserActiveTeamMember(ventoUser) && !isUserTeamAdmin(ventoUser)) ?
        <>
          <p><strong>Cannot delete data of an active team member.</strong></p>
          <p>Please contact your team admin for assistance.</p>
          <div className="cta-container"
            style={{ width: "fit-content", margin: "auto", marginTop: "1rem" }}>
            <button onClick={onClose} className="confirm-btn">
              Got it
            </button>
          </div>
        </> :

        (isUserFreePlan(ventoUser) || isLtd(ventoUser)) ?
          <>
            <p>All recordings, folders, shared videos, etc will be removed from our server. This action is <strong>PERMANENT</strong> and <strong>CANNOT</strong> be undone. You will be logged out and an email confirmation will be sent to you when completed.</p>
            <div className="cta-container">
              <button onClick={onConfirm} disabled={loading} className="confirm-btn--delete">
                {loading ? (
                  <Loader size="sm" color="black" />
                ) : (
                  <p>DELETE MY ACCOUNT</p>
                )}
              </button>
              <button onClick={onClose} disabled={loading} className="cancel-btn">
                Cancel
              </button>
            </div>
          </>
          :
          <>
            <p>Please reach out to support to delete your account.</p>
            <div className="cta-container"
              style={{ width: "fit-content", margin: "auto", marginTop: "1rem" }}>
              <button onClick={onClose} className="confirm-btn">
                Got it
              </button>
            </div>
          </>
      }
    </Modal>
  );
}
