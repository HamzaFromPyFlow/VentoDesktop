import { useState, useReducer } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Menu } from '@mantine/core';
import { BsRecordCircle } from 'react-icons/bs';
import { FaUserAlt } from 'react-icons/fa';
import { IoExitOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoDiamondOutline } from 'react-icons/io5';
import { MdAttachMoney } from 'react-icons/md';
import { generateUrl, stripeLinkId } from '../../lib/helper-pure';
import { isLtd, isUserActiveTeamMember, isUserFreePlan, isUserTeamAdmin } from '../../lib/payment-helper';
import { useAuth } from '../../stores/authStore';
import AdminBillingModal from '../overlays/modals/AdminBillingModal';
import UpgradeToPremiumModal from '../overlays/modals/UpgradeToPremiumModal';
import styles from '../../styles/modules/ProfileDropdown.module.scss';

type ModalStates = {
  billingModal: boolean;
};

export default function ProfileDropdownBtn() {
  const { ventoUser, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [upgradeToPremiumModalOpen, setUpgradeToPremiumModalOpen] = useState(false);

  const [modalStates, setModalStates] = useReducer(
    (prev: ModalStates, cur: Partial<ModalStates>) => {
      return { ...prev, ...cur };
    },
    {
      billingModal: false,
    }
  );

  const handleClose = () => {
    setModalStates({ billingModal: false });
  };

  const modalAction = () => {
    window.open(
      `https://billing.stripe.com/p/login/${stripeLinkId}?prefilled_email=${(ventoUser as any)?.email}`,
      "_blank"
    );
  };


  return (
    <>
      <Menu trigger="hover" shadow="md" radius="md">
        <Menu.Target>
          <button className={!(ventoUser as any)?.profilePhotoUrl ? styles.profileBtn : ''}>
            {(ventoUser as any)?.profilePhotoUrl ? (
              <div className={styles.profileBtn}>
                <img
                  alt="user profile"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  src={'/assets/list-icon.svg'}
                  height={25}
                  width={25}
                />
                <img
                  alt="user profile"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  src={(ventoUser as any).profilePhotoUrl}
                  className={styles.profileImg}
                  width={'38px'}
                  height={'38px'}
                />
              </div>
            ) : (
              <FaUserAlt />
            )}
          </button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>{(ventoUser as any)?.displayName || (ventoUser as any)?.name}</Menu.Label>

          <a href={generateUrl("/recordings", searchParams)}>
            <Menu.Item icon={<BsRecordCircle size={14} />}>
              View Recordings
            </Menu.Item>
          </a>
          <a href={generateUrl("/profile")}>
            <Menu.Item icon={<IoSettingsOutline size={14} />}>
              Account and settings
            </Menu.Item>
          </a>
          {!isUserFreePlan(ventoUser) && !isLtd(ventoUser) && (!isUserActiveTeamMember(ventoUser) || isUserTeamAdmin(ventoUser)) && (
            <Menu.Item
              icon={<MdAttachMoney size={14} />}
              onClick={() => {
                if (isUserActiveTeamMember(ventoUser) && isUserTeamAdmin(ventoUser)) {
                  setModalStates({ billingModal: true });
                } else {
                  modalAction();
                }
              }}
            >
              Billing
            </Menu.Item>
          )}
          {(!isUserActiveTeamMember(ventoUser) || isUserTeamAdmin(ventoUser)) && (
            <Menu.Item
              icon={<IoDiamondOutline size={14} />}
              style={isUserFreePlan(ventoUser) ? { backgroundColor: "#FEED78" } : {}}
              onClick={() => {
                navigate('/pricing');
              }}
            >
              Plans and Pricing
            </Menu.Item>
          )}
          <Menu.Item onClick={signOut} icon={<IoExitOutline size={14} />}>
            Log Out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <UpgradeToPremiumModal
        opened={upgradeToPremiumModalOpen}
        onClose={() => {
          setUpgradeToPremiumModalOpen(false);
        }}
        recordingLimitReached={false}
        paymentSuccessful={false}
      />
      <AdminBillingModal
        opened={modalStates.billingModal}
        onClose={handleClose}
        billingAction={modalAction}
      />
    </>
  );
}
