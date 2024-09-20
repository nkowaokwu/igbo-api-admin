import React, { ReactElement } from 'react';
import { Avatar, Box, Heading, Link, Text, Tooltip, chakra, useToast, useBreakpointValue } from '@chakra-ui/react';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import { usePermissions } from 'react-admin';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';
import copyToClipboard from 'src/shared/utils/copyToClipboard';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import Gender from 'src/backend/shared/constants/Gender';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';

const UserCard = ({
  displayName,
  photoURL,
  email,
  gender,
}: Partial<FormattedUser> & {
  age: number;
  dialects: DialectEnum[];
  gender: GenderEnum;
}): ReactElement => {
  const permissions = usePermissions();
  const toast = useToast();
  const isAdmin = hasAdminPermissions(permissions.permissions, true);
  const avatarSize = useBreakpointValue({ base: 'lg', lg: 'xl' });

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
      <Avatar
        name=""
        icon={<></>}
        src={photoURL}
        size={avatarSize}
        bgGradient="linear(to-br, yellow.200, orange.500)"
      />
      <Box>
        <Heading className={!displayName ? 'text-gray-500' : ''} fontSize={{ base: '2xl', lg: '3xl' }}>
          {displayName || 'No display name'}
        </Heading>
        <Box className="my-2">
          <Box className="flex flex-col lg:flex-row lg:items-center lg:space-x-3">
            <Text fontFamily="heading" textAlign="left">
              <chakra.span mr={1} fontWeight="bold">
                Gender:
              </chakra.span>
              {(Gender[gender]?.value !== 'UNSPECIFIED' && Gender[gender]?.label) || (
                <chakra.span fontStyle="italic" color="gray.400">
                  Not selected
                </chakra.span>
              )}
            </Text>
          </Box>
        </Box>
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
