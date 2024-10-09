import React, { ReactElement } from 'react';
import {
  Avatar,
  Box,
  Heading,
  Link,
  Text,
  Tooltip,
  chakra,
  useToast,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import copyToClipboard from 'src/shared/utils/copyToClipboard';
import { UserProfile } from 'src/backend/controllers/utils/interfaces';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import Gender from 'src/backend/shared/constants/Gender';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import { LuCopy } from 'react-icons/lu';
import UserRoleLabels from 'src/backend/shared/constants/UserRoleLabels';

const UserCard = ({ user }: { user: UserProfile }): ReactElement => {
  const permissions = usePermissions();
  const toast = useToast();
  const isAdmin = hasAdminPermissions(permissions.permissions, true);
  const avatarSize = useBreakpointValue({ base: 'lg', lg: 'xl' });
  const { email, displayName, photoURL, gender, languages, role } = user || {
    email: '',
    displayName: '',
    photoURL: '',
    gender: GenderEnum.UNSPECIFIED,
    languages: [],
  };

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
      <VStack width="full" alignItems="start">
        <Heading
          color={!displayName ? 'gray.500' : ''}
          fontSize={{ base: '2xl', lg: '3xl' }}
          textAlign={{ base: 'center', md: 'left' }}
        >
          {displayName || 'No display name'}
        </Heading>
        <Box className="my-2">
          <VStack width="full" alignItems="start">
            <Text textAlign="left">
              <chakra.span mr={1} fontWeight="medium">
                Languages:
              </chakra.span>
              {languages?.length ? (
                <chakra.span>
                  {user.languages.map((language) => LanguageLabels[language]?.label).join(', ')}
                </chakra.span>
              ) : (
                <chakra.span fontStyle="italic" color="gray.400">
                  Not selected
                </chakra.span>
              )}
            </Text>
            <Text textAlign="left">
              <chakra.span mr={1} fontWeight="medium">
                Gender:
              </chakra.span>
              {(Gender[gender]?.value !== 'UNSPECIFIED' && Gender[gender]?.label) || (
                <chakra.span fontStyle="italic" color="gray.400">
                  Not selected
                </chakra.span>
              )}
            </Text>
            <Text textAlign="left">
              <chakra.span mr={1} fontWeight="medium">
                Role:
              </chakra.span>
              {UserRoleLabels[role]?.label || (
                <chakra.span fontStyle="italic" color="gray.400">
                  No role
                </chakra.span>
              )}
            </Text>
            <Text>
              <chakra.span mr={1} fontWeight="medium">
                Email:
              </chakra.span>
              <Link color="blue.500" href={`mailto:${email}`}>
                {email}
              </Link>
              {isAdmin ? (
                <Tooltip label={`Copy ${displayName}'s email`}>
                  <chakra.span ml={1} cursor="pointer">
                    <LuCopy className="inline" onClick={handleCopyId} />
                  </chakra.span>
                </Tooltip>
              ) : null}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default UserCard;
