import React, { ReactElement } from 'react';
import { Link, Tooltip, chakra } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';

const SpeakerLabel = ({ currentSpeaker }: { currentSpeaker: FormattedUser }): ReactElement => (
  <chakra.span fontSize="xs" color="gray.500">
    <chakra.span mr={1}>Speaker:</chakra.span>
    <Tooltip label="Click to view user profile">
      <Link
        color="gray.500"
        fontStyle="italic"
        target="_blank"
        textDecoration="underline"
        href={`#/${Collections.USERS}/${currentSpeaker.uid}/${Views.SHOW}`}
      >
        {currentSpeaker?.displayName || ''}
        <ExternalLinkIcon boxSize="3" color="gray.500" ml={1} />
      </Link>
    </Tooltip>
  </chakra.span>
);

export default SpeakerLabel;
