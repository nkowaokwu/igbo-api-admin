import React, { useState, ReactElement } from 'react';
import moment from 'moment';
import {
  Avatar,
  Button,
  Box,
  Heading,
  Input,
  Link,
  Select,
  Text,
  Tooltip,
  chakra,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react';
import { EditIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { merge } from 'lodash';
import { updateUserProfile } from 'src/shared/UserAPI';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import DatePicker from 'react-date-picker';
import { usePermissions } from 'react-admin';
import { FormattedUser } from 'src/backend/controllers/utils/interfaces';
import copyToClipboard from 'src/shared/utils/copyToClipboard';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import Dialect from 'src/backend/shared/constants/Dialect';
import Gender from 'src/backend/shared/constants/Gender';
import DialectEnum from 'src/backend/shared/constants/DialectEnum';
import GenderEnum from 'src/backend/shared/constants/GenderEnum';

const UserCard = ({
  displayName,
  photoURL,
  email,
  age,
  gender,
  dialects,
}: Partial<FormattedUser> & {
  age: number;
  gender: GenderEnum;
  dialects: DialectEnum[];
}): ReactElement => {
  const [birthday, setBirthday] = useState(age);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingUserProfile, setIsEditingUserProfile] = useState(false);
  const permissions = usePermissions();
  const toast = useToast();
  const isAdmin = hasAdminPermissions(permissions.permissions, true);
  const avatarSize = useBreakpointValue({ base: 'lg', lg: 'xl' });

  const handleEditButton = async () => {
    if (isEditingUserProfile) {
      setIsLoading(true);
      const displayName = (document.querySelector('#user-profile-display-name-input') as HTMLInputElement).value;
      const age = moment((document.querySelector('#user-profile-age-input') as HTMLInputElement).value).toDate();
      const dialect = (document.querySelector('#user-dialect-input') as HTMLSelectElement).value as DialectEnum;
      const gender = (document.querySelector('#user-gender-input') as HTMLSelectElement).value as GenderEnum;

      const payload = { displayName, age, dialects: [dialect], gender };
      try {
        // Save the user profile
        const savedProfile = await updateUserProfile({ userId: uid, userProfile: payload });
        setUser(merge(user, savedProfile));
        toast({
          title: 'Saved changes',
          position: 'top-right',
          variant: 'left-accent',
          description: 'Your profile has been updated',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'Unable to save',
          position: 'top-right',
          variant: 'left-accent',
          description: 'An error occurred while updating user profile',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        setIsEditingUserProfile(false);
      }
    } else {
      setIsEditingUserProfile(true);
    }
  };

  // Does not save the user's profile changes
  const handleOnCancel = () => {
    setIsEditingUserProfile(false);
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
      <Box className="flex flex-row space-x-3 items-center">
        <Tooltip label={isEditingUserProfile ? 'Save your changes' : 'Edit your profile'}>
          <Button
            variant="primary"
            backgroundColor="primary"
            color="white"
            leftIcon={<EditIcon boxSize={4} />}
            onClick={handleEditButton}
            isLoading={isLoading}
          >
            {isEditingUserProfile ? 'Save' : 'Edit'}
          </Button>
        </Tooltip>
        <Tooltip label="Discard your changes">
          <>
            {isEditingUserProfile ? (
              <Button
                variant="ghost"
                leftIcon={<SmallCloseIcon boxSize={4} />}
                onClick={handleOnCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            ) : null}
          </>
        </Tooltip>
      </Box>
      <Avatar name={displayName} src={photoURL} size={avatarSize} />
      <Box>
        {isEditingUserProfile ? (
          <Box className="flex flex-col space-y-3">
            <Box className="flex flex-col lg:flex-row space-x-3">
              <Box>
                <Text fontFamily="heading">Full name</Text>
                <Input
                  id="user-profile-display-name-input"
                  data-test="user-profile-display-name-input"
                  fontFamily="heading"
                  defaultValue={displayName}
                />
              </Box>
              <Box>
                <Text fontFamily="heading">Birthday</Text>
                <DatePicker onChange={setBirthday} value={birthday} />
                <Input
                  position="absolute"
                  opacity={0}
                  pointerEvents="none"
                  id="user-profile-age-input"
                  value={birthday}
                />
              </Box>
            </Box>
            <Box className="flex flex-row space-x-3">
              <Box>
                <Text fontFamily="heading">Native dialect</Text>
                <Select id="user-dialect-input" defaultValue={dialects[0]}>
                  {Object.values(Dialect).map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text fontFamily="heading">Gender</Text>
                <Select id="user-gender-input" defaultValue={gender}>
                  {Object.values(Gender).map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            <Heading className={!displayName ? 'text-gray-500' : ''} fontSize={{ base: '2xl', lg: '3xl' }}>
              {displayName || 'No display name'}
            </Heading>
            <Box className="my-2">
              <Box className="flex flex-col lg:flex-row lg:items-center lg:space-x-3">
                <Text fontFamily="heading" textAlign="left">
                  <chakra.span mr={1} fontWeight="bold">
                    Birthday:
                  </chakra.span>
                  {birthday ? (
                    moment(birthday).format('MMMM D, YYYY')
                  ) : (
                    <chakra.span color="gray.400">No birthday set</chakra.span>
                  )}
                </Text>
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
              <Text fontFamily="heading" textAlign="left">
                <chakra.span mr={1} fontWeight="bold">
                  Dialects:
                </chakra.span>
                {dialects?.length ? (
                  dialects.map((dialect) => Dialect[dialect].label).join(', ')
                ) : (
                  <chakra.span color="gray.400">No dialects selected</chakra.span>
                )}
              </Text>
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default UserCard;
