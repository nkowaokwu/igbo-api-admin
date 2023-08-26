import React, { ReactElement } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';
import SpeakerLabel from 'src/Core/Collections/components/SpeakerNameManager/SpeakerLabel';
import SpeakerOptions from 'src/Core/Collections/components/SpeakerNameManager/SpeakerOptions';

const SpeakerNameManager = ({
  isLoading,
  speakers,
  index,
}: {
  isLoading: boolean;
  speakers: FormattedUser[];
  index: number;
}): ReactElement => {
  const permissions = usePermissions();
  const isAdmin = permissions?.permissions?.role === UserRoles.ADMIN;
  const currentSpeaker = isAdmin ? (speakers || [])[index] : null;
  return !isLoading && currentSpeaker ? (
    <Box className={`w-full flex flex-row ${isAdmin ? 'justify-between' : 'justify-end'} items-center`}>
      <SpeakerLabel currentSpeaker={currentSpeaker} />
      <SpeakerOptions uid={currentSpeaker?.uid} displayName={currentSpeaker?.displayName} />
    </Box>
  ) : isLoading ? (
    <Text fontSize="xs" color="gray.500" fontStyle="italic">
      Loading speaker name...
    </Text>
  ) : null;
};

export default SpeakerNameManager;
