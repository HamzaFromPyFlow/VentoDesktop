import React, { useReducer } from 'react';
import InviteUsersModal from '../overlays/modals/InviteUsersModal';
// TODO: Import PricingPageModal when it's created
// import PricingPageModal from '../overlays/modals/PricingPageModal';
import InviteUsers from './InviteUsers';
import styles from '../../styles/modules/InviteUsers.module.scss';

type ModalStates = {
  inviteModal: boolean;
  pricingModal: boolean;
};

interface InviteUsersButtonProps {
  fetchMembers?: () => Promise<void>;
}

export default function InviteUsersButton({ fetchMembers }: InviteUsersButtonProps) {
  // TODO: Get ventoUser from auth context/store
  // const { ventoUser } = useAuth();
  const ventoUser: any = null; // Placeholder

  const [modalStates, setModalStates] = useReducer(
    (prev: ModalStates, cur: Partial<ModalStates>) => {
      return { ...prev, ...cur };
    },
    {
      inviteModal: false,
      pricingModal: false,
    }
  );

  const handleInviteClick = () => {
    // TODO: Check if user is on free plan
    // if (isUserFreePlan(ventoUser)) {
    //   setModalStates({ pricingModal: true });
    // } else {
    //   setModalStates({ inviteModal: true });
    // }
    setModalStates({ inviteModal: true });
  };

  const handleClose = () => {
    setModalStates({ inviteModal: false });
  };

  // TODO: Uncomment when auth and payment helpers are available
  // if (!ventoUser?.teamMemberships || ventoUser?.teamMemberships?.[0]?.role === 'RECORDER') {
  //   return null;
  // }

  return (
    <>
      <button className={styles.inviteBtn} onClick={handleInviteClick}>
        Invite Users
      </button>
      <InviteUsersModal opened={modalStates.inviteModal} onClose={handleClose}>
        {modalStates.inviteModal && <InviteUsers onClose={handleClose} fetchMembers={fetchMembers} />}
      </InviteUsersModal>
      {/* TODO: Uncomment when PricingPageModal is created */}
      {/* <PricingPageModal
        opened={modalStates.pricingModal}
        onClose={() => setModalStates({ pricingModal: false })}
      /> */}
    </>
  );
}
