import React, { ReactElement } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { LuArchive, LuPlug2, LuTrash2 } from 'react-icons/lu';

const ResourceConnectionButton = ({
  tooltip,
  shouldArchive = false,
  shouldDetach = false,
  onClick,
}: {
  tooltip: string;
  shouldArchive?: boolean;
  shouldDetach?: boolean;
  onClick: () => void;
}): ReactElement => (
  <Tooltip label={tooltip}>
    <IconButton
      backgroundColor={shouldArchive ? 'orange.100' : 'red.100'}
      _hover={{
        backgroundColor: shouldArchive ? 'orange.200' : 'red.200',
      }}
      aria-label={shouldArchive ? 'Archive' : shouldDetach ? 'Detach' : 'Delete'}
      onClick={onClick}
      className="ml-3"
      icon={shouldArchive ? <LuArchive /> : shouldDetach ? <LuPlug2 /> : <LuTrash2 />}
    />
  </Tooltip>
);

export default ResourceConnectionButton;
