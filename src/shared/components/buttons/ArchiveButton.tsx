import React, { ReactElement } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';

const ArchiveButton = ({
  tooltip,
  shouldArchive = false,
  onClick,
}: {
  tooltip: string;
  shouldArchive?: boolean;
  onClick: () => void;
}): ReactElement => (
  <Tooltip label={tooltip}>
    <IconButton
      backgroundColor={shouldArchive ? 'orange.100' : 'red.100'}
      _hover={{
        backgroundColor: shouldArchive ? 'orange.200' : 'red.200',
      }}
      aria-label={shouldArchive ? 'Archive' : 'Delete'}
      onClick={onClick}
      className="ml-3"
      icon={shouldArchive ? (() => <>🗄</>)() : (() => <>🗑</>)()}
    />
  </Tooltip>
);

export default ArchiveButton;
