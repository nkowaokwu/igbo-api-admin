import React, { ReactElement } from 'react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import ConfirmFlagUserModal from 'src/Core/Collections/IgboSoundbox/components/SpeakerOptions/ConfirmFlagUserModal';
import { sendReportUserEmail, ReportUserInterface } from 'src/shared/PlatformAPI';

const auth = getAuth();

const SpeakerOptions = ({ uid, displayName = '' }: { uid: string; displayName: string }): ReactElement => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleReportUser = async ({ reason, details }: { reason: string; details: string }) => {
    const { currentUser } = auth;
    const payload: ReportUserInterface = {
      reportedDisplayName: displayName,
      reportedUid: uid,
      reporterDisplayName: currentUser.displayName,
      reporterUid: currentUser.uid,
      reason,
      details,
    };
    await sendReportUserEmail(payload);
  };

  return (
    <>
      <ConfirmFlagUserModal
        title={`Report ${displayName}`}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleReportUser}
      />
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MoreVertIcon sx={{ color: 'var(--chakra-colors-gray-500)' }} />}
          data-test="speaker-options-menu-button"
        />
        <MenuList>
          <MenuItem onClick={onOpen}>
            <FlagIcon />
            Report user
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default SpeakerOptions;
