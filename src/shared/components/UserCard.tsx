import React, { ReactElement } from 'react';
import { Avatar, Box, Heading, Link, Tooltip, useToast } from '@chakra-ui/react';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';
import copyToClipboard from 'src/shared/utils/copyToClipboard';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import { usePermissions } from 'react-admin';

const UserCard = ({ displayName, photoURL, email }: Partial<FormattedUser>): ReactElement => {
  const permissions = usePermissions();
  const toast = useToast();
  const isAdmin = hasAdminPermissions(permissions.permissions, true);

  const handleCopyId = () => {
    copyToClipboard(
      {
        copyText: email,
        successMessage: `${displayName}'s email has been copied to your clipboard`,
      },
      toast,
    );
  };

  return (
    <Box className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-x-4 mb-4 p-6">
      <Avatar name={displayName} src={photoURL} size="xl" />
      <Box>
        <Heading className={!displayName ? 'text-gray-500 italic' : ''}>{displayName || 'No display name'}</Heading>
        <Box className="flex flex-row space-x-2">
          <Link color="green" href={`mailto:${email}`}>
            {email}
          </Link>
          {isAdmin ? (
            <Tooltip label={`Copy ${displayName}'s email`}>
              <FileCopyIcon className="cursor-pointer" style={{ height: 20 }} onClick={handleCopyId} />
            </Tooltip>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default UserCard;
